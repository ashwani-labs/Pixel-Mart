package com.pixelmart.catalog.service;

import com.pixelmart.catalog.dto.HeroSlideDtos.HeroCtaDto;
import com.pixelmart.catalog.dto.HeroSlideDtos.HeroSlideDto;

import java.util.List;

final class HeroSlideDefaults {

    private HeroSlideDefaults() {
    }

    static List<HeroSlideDto> defaultSlides() {
        return List.of(
                new HeroSlideDto(
                        "savings",
                        "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?auto=format&fit=crop&w=1600&q=80",
                        "Colorful shopping bags and gifts",
                        "Everyday savings",
                        "Shop smarter. Save more.",
                        "Electronics, groceries, fashion and more — clear pricing, fast checkout.",
                        new HeroCtaDto("Browse products", "/products"),
                        new HeroCtaDto("Shop groceries", "/products?superCategoryId=super-grocery")
                ),
                new HeroSlideDto(
                        "electronics",
                        "https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=1600&q=80",
                        "Laptop and tech gadgets on a desk",
                        "Tech deals",
                        "Upgrade your everyday tech.",
                        "Phones, laptops, audio and smart home — fresh picks with fast delivery.",
                        new HeroCtaDto("Shop electronics", "/products?superCategoryId=super-electronics"),
                        new HeroCtaDto("Featured picks", "/products?featured=true")
                ),
                new HeroSlideDto(
                        "grocery",
                        "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1600&q=80",
                        "Fresh produce in a grocery store",
                        "Fresh & value",
                        "Groceries delivered to your door.",
                        "Daily essentials, snacks and pantry staples at prices you can trust.",
                        new HeroCtaDto("Shop groceries", "/products?superCategoryId=super-grocery"),
                        new HeroCtaDto("View all aisles", "/products")
                ),
                new HeroSlideDto(
                        "fashion",
                        "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1600&q=80",
                        "Fashion boutique clothing display",
                        "New season",
                        "Style that fits your budget.",
                        "Trending fashion, footwear and accessories — easy returns within 7 days.",
                        new HeroCtaDto("Shop fashion", "/products?superCategoryId=super-fashion"),
                        new HeroCtaDto("Today's deals", "/products")
                )
        );
    }
}
