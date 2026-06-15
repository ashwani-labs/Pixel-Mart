package com.pixelmart.catalog.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.pixelmart.catalog.domain.StoreSettings;
import com.pixelmart.catalog.dto.HeroSlideDtos.HeroSlideDto;
import com.pixelmart.catalog.dto.HeroSlideDtos.HeroSlidesResponse;
import com.pixelmart.catalog.dto.HeroSlideDtos.UpdateHeroSlidesRequest;
import com.pixelmart.catalog.exception.BadRequestException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class HeroSlideService {

    private static final TypeReference<List<HeroSlideDto>> SLIDE_LIST_TYPE = new TypeReference<>() {
    };

    private final StoreSettingsService storeSettingsService;
    private final ObjectMapper objectMapper;

    public HeroSlideService(StoreSettingsService storeSettingsService, ObjectMapper objectMapper) {
        this.storeSettingsService = storeSettingsService;
        this.objectMapper = objectMapper;
    }

    @Transactional(readOnly = true)
    public HeroSlidesResponse getPublic() {
        return new HeroSlidesResponse(loadSlides());
    }

    @Transactional(readOnly = true)
    public HeroSlidesResponse getAdmin() {
        return new HeroSlidesResponse(loadSlides());
    }

    @Transactional
    public HeroSlidesResponse update(UpdateHeroSlidesRequest request) {
        StoreSettings settings = storeSettingsService.findSettings();
        try {
            settings.setHeroSlidesJson(objectMapper.writeValueAsString(request.slides()));
        } catch (Exception ex) {
            throw new BadRequestException("Could not save hero slides");
        }
        storeSettingsService.save(settings);
        return new HeroSlidesResponse(request.slides());
    }

    List<HeroSlideDto> loadSlides() {
        StoreSettings settings = storeSettingsService.findSettings();
        if (settings.getHeroSlidesJson() == null || settings.getHeroSlidesJson().isBlank()) {
            return HeroSlideDefaults.defaultSlides();
        }
        try {
            return objectMapper.readValue(settings.getHeroSlidesJson(), SLIDE_LIST_TYPE);
        } catch (Exception ex) {
            return HeroSlideDefaults.defaultSlides();
        }
    }
}
