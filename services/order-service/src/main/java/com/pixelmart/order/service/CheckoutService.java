package com.pixelmart.order.service;

import com.pixelmart.order.client.CatalogClient;
import com.pixelmart.order.client.CatalogClient.ReserveStockLine;
import com.pixelmart.order.client.CatalogProductSnapshot;
import com.pixelmart.order.client.CatalogStoreSettings;
import com.pixelmart.order.domain.Address;
import com.pixelmart.order.domain.Cart;
import com.pixelmart.order.domain.CartItem;
import com.pixelmart.order.domain.Order;
import com.pixelmart.order.domain.OrderItem;
import com.pixelmart.order.domain.Payment;
import com.pixelmart.order.dto.CheckoutDtos.CheckoutRequest;
import com.pixelmart.order.dto.CheckoutDtos.OrderResponse;
import com.pixelmart.order.dto.CheckoutDtos.PaymentMethod;
import com.pixelmart.order.exception.BadRequestException;
import com.pixelmart.order.exception.ResourceNotFoundException;
import com.pixelmart.order.repository.AddressRepository;
import com.pixelmart.order.repository.CartItemRepository;
import com.pixelmart.order.repository.CartRepository;
import com.pixelmart.order.repository.OrderItemRepository;
import com.pixelmart.order.repository.OrderRepository;
import com.pixelmart.order.repository.PaymentRepository;
import com.pixelmart.order.security.CurrentUser;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.Instant;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
public class CheckoutService {

    private static final DateTimeFormatter ORDER_NUMBER_TIME =
            DateTimeFormatter.ofPattern("yyyyMMddHHmmss").withZone(ZoneOffset.UTC);

    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final AddressRepository addressRepository;
    private final OrderRepository orderRepository;
    private final OrderItemRepository orderItemRepository;
    private final PaymentRepository paymentRepository;
    private final CatalogClient catalogClient;

    public CheckoutService(
            CartRepository cartRepository,
            CartItemRepository cartItemRepository,
            AddressRepository addressRepository,
            OrderRepository orderRepository,
            OrderItemRepository orderItemRepository,
            PaymentRepository paymentRepository,
            CatalogClient catalogClient
    ) {
        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
        this.addressRepository = addressRepository;
        this.orderRepository = orderRepository;
        this.orderItemRepository = orderItemRepository;
        this.paymentRepository = paymentRepository;
        this.catalogClient = catalogClient;
    }

    @Transactional
    public OrderResponse checkout(CheckoutRequest request) {
        String userId = CurrentUser.requireUserId();
        Cart cart = cartRepository.findByUserId(userId)
                .orElseThrow(() -> new BadRequestException("Cart is empty"));
        List<CartItem> cartItems = cartItemRepository.findByCartIdOrderByCreatedAtAsc(cart.getId());
        if (cartItems.isEmpty()) {
            throw new BadRequestException("Cart is empty");
        }
        Address address = addressRepository.findByIdAndUserId(request.addressId(), userId)
                .orElseThrow(() -> new ResourceNotFoundException("Address", request.addressId()));

        Map<String, CatalogProductSnapshot> products = loadProducts(cartItems);
        List<ReserveStockLine> stockLines = cartItems.stream()
                .map(item -> new ReserveStockLine(item.getProductId(), item.getQuantity()))
                .toList();
        catalogClient.reserveStock(stockLines);

        CatalogStoreSettings settings = catalogClient.getStoreSettings();
        BigDecimal subtotal = subtotal(cartItems, products);
        BigDecimal taxRate = settings.effectiveTaxRate();
        BigDecimal taxTotal = subtotal.multiply(taxRate)
                .divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        BigDecimal grandTotal = subtotal.add(taxTotal);

        Order order = orderRepository.save(buildOrder(
                userId,
                address,
                request.paymentMethod(),
                subtotal,
                taxTotal,
                grandTotal,
                settings
        ));
        List<OrderItem> orderItems = orderItemRepository.saveAll(buildOrderItems(order, cartItems, products));
        Payment payment = paymentRepository.save(buildPayment(order, request.paymentMethod(), grandTotal));
        cartItemRepository.deleteByCartId(cart.getId());

        return OrderResponse.from(order, orderItems, payment);
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> listOrders() {
        String userId = CurrentUser.requireUserId();
        return orderRepository.findByUserIdOrderByCreatedAtDesc(userId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public OrderResponse getOrder(String id) {
        String userId = CurrentUser.requireUserId();
        Order order = orderRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Order", id));
        return toResponse(order);
    }

    private Map<String, CatalogProductSnapshot> loadProducts(List<CartItem> cartItems) {
        Map<String, CatalogProductSnapshot> products = new LinkedHashMap<>();
        for (CartItem item : cartItems) {
            products.computeIfAbsent(item.getProductId(), productId -> {
                CatalogProductSnapshot product = catalogClient.getProductForCart(productId);
                if (!product.visible()) {
                    throw new BadRequestException("Product is no longer available: " + product.name());
                }
                if (product.stockQty() < item.getQuantity()) {
                    throw new BadRequestException("Insufficient stock for " + product.name());
                }
                return product;
            });
        }
        return products;
    }

    private BigDecimal subtotal(List<CartItem> cartItems, Map<String, CatalogProductSnapshot> products) {
        return cartItems.stream()
                .map(item -> products.get(item.getProductId()).basePrice()
                        .multiply(BigDecimal.valueOf(item.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private Order buildOrder(
            String userId,
            Address address,
            PaymentMethod method,
            BigDecimal subtotal,
            BigDecimal taxTotal,
            BigDecimal grandTotal,
            CatalogStoreSettings settings
    ) {
        Order order = new Order();
        order.setOrderNumber(generateOrderNumber());
        order.setUserId(userId);
        order.setAddressId(address.getId());
        order.setStatus(method == PaymentMethod.MOCK_COD ? "PENDING" : "CONFIRMED");
        order.setSubtotal(subtotal);
        order.setTaxTotal(taxTotal);
        order.setGrandTotal(grandTotal);
        order.setTaxLabel(settings.effectiveTaxLabel());
        order.setTaxRatePercent(settings.effectiveTaxRate());
        order.setPaymentMethod(method.name());
        order.setPaymentStatus(method == PaymentMethod.MOCK_COD ? "PENDING" : "PAID");
        order.setShipToName(address.getFullName());
        order.setShipToPhone(address.getPhone());
        order.setShipAddressLine1(address.getAddressLine1());
        order.setShipAddressLine2(address.getAddressLine2());
        order.setShipCity(address.getCity());
        order.setShipState(address.getState());
        order.setShipPincode(address.getPincode());
        order.setShipCountry(address.getCountry());
        order.setShipPostOfficeName(address.getPostOfficeName());
        return order;
    }

    private List<OrderItem> buildOrderItems(
            Order order,
            List<CartItem> cartItems,
            Map<String, CatalogProductSnapshot> products
    ) {
        return cartItems.stream().map(item -> {
            CatalogProductSnapshot product = products.get(item.getProductId());
            OrderItem orderItem = new OrderItem();
            orderItem.setOrderId(order.getId());
            orderItem.setProductId(product.id());
            orderItem.setProductName(product.name());
            orderItem.setProductSlug(product.slug());
            orderItem.setUnitPrice(product.basePrice());
            orderItem.setQuantity(item.getQuantity());
            orderItem.setLineTotal(product.basePrice().multiply(BigDecimal.valueOf(item.getQuantity())));
            return orderItem;
        }).toList();
    }

    private Payment buildPayment(Order order, PaymentMethod method, BigDecimal amount) {
        Payment payment = new Payment();
        payment.setOrderId(order.getId());
        payment.setMethod(method.name());
        payment.setStatus(method == PaymentMethod.MOCK_COD ? "PENDING" : "PAID");
        payment.setAmount(amount);
        payment.setProviderReference("MOCK-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase());
        return payment;
    }

    private OrderResponse toResponse(Order order) {
        List<OrderItem> items = orderItemRepository.findByOrderIdOrderByCreatedAtAsc(order.getId());
        Payment payment = paymentRepository.findByOrderId(order.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Payment", order.getId()));
        return OrderResponse.from(order, items, payment);
    }

    private String generateOrderNumber() {
        return "PM" + ORDER_NUMBER_TIME.format(Instant.now())
                + UUID.randomUUID().toString().substring(0, 4).toUpperCase();
    }
}
