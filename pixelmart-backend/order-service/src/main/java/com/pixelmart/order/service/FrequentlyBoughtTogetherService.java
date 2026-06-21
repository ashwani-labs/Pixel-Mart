package com.pixelmart.order.service;

import com.pixelmart.order.dto.FrequentlyBoughtTogetherResponse;
import com.pixelmart.order.repository.OrderItemRepository;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class FrequentlyBoughtTogetherService {

  private final OrderItemRepository orderItemRepository;

  public FrequentlyBoughtTogetherService(OrderItemRepository orderItemRepository) {
    this.orderItemRepository = orderItemRepository;
  }

  @Transactional(readOnly = true)
  public FrequentlyBoughtTogetherResponse suggest(String productId, int limit) {
    List<String> productIds =
        orderItemRepository.findFrequentlyBoughtTogetherProductIds(productId, limit);
    return new FrequentlyBoughtTogetherResponse(productIds);
  }
}
