package com.pixelmart.catalog.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.util.List;

public final class HeroSlideDtos {

  private HeroSlideDtos() {}

  public record HeroCtaDto(
      @NotBlank @Size(max = 64) String label, @NotBlank @Size(max = 255) String to) {}

  public record HeroSlideDto(
      @NotBlank @Size(max = 64) String id,
      @NotBlank @Size(max = 512) String image,
      @NotBlank @Size(max = 255) String imageAlt,
      @NotBlank @Size(max = 64) String badge,
      @NotBlank @Size(max = 255) String title,
      @NotBlank @Size(max = 512) String subtitle,
      @Valid @NotNull HeroCtaDto primaryCta,
      @Valid @NotNull HeroCtaDto secondaryCta) {}

  public record HeroSlidesResponse(List<HeroSlideDto> slides) {}

  public record UpdateHeroSlidesRequest(@NotEmpty @Valid List<HeroSlideDto> slides) {}
}
