package com.pixelmart.auth.service;

import com.pixelmart.auth.domain.ReferralRedemption;
import com.pixelmart.auth.domain.User;
import com.pixelmart.auth.exception.BadRequestException;
import com.pixelmart.auth.exception.ResourceNotFoundException;
import com.pixelmart.auth.repository.ReferralRedemptionRepository;
import com.pixelmart.auth.repository.UserRepository;
import java.security.SecureRandom;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class LoyaltyService {

  private static final int REFERRER_BONUS = 100;
  private static final int REFEREE_BONUS = 50;
  private static final String REFERRAL_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  private static final SecureRandom RANDOM = new SecureRandom();

  private final UserRepository userRepository;
  private final ReferralRedemptionRepository referralRedemptionRepository;

  public LoyaltyService(
      UserRepository userRepository, ReferralRedemptionRepository referralRedemptionRepository) {
    this.userRepository = userRepository;
    this.referralRedemptionRepository = referralRedemptionRepository;
  }

  @Transactional
  public void assignReferralCode(User user) {
    if (user.getReferralCode() != null && !user.getReferralCode().isBlank()) {
      return;
    }
    user.setReferralCode(generateUniqueReferralCode());
  }

  @Transactional
  public void applyReferral(String referralCode, User referee) {
    if (referralCode == null || referralCode.isBlank()) {
      return;
    }
    if (referralRedemptionRepository.existsByRefereeUserId(referee.getId())) {
      return;
    }
    User referrer =
        userRepository
            .findByReferralCodeIgnoreCase(referralCode.trim())
            .filter(User::isEnabled)
            .orElseThrow(() -> new BadRequestException("Invalid referral code"));
    if (referrer.getId().equals(referee.getId())) {
      throw new BadRequestException("You cannot use your own referral code");
    }
    referrer.setLoyaltyPoints(referrer.getLoyaltyPoints() + REFERRER_BONUS);
    referee.setLoyaltyPoints(referee.getLoyaltyPoints() + REFEREE_BONUS);
    ReferralRedemption redemption = new ReferralRedemption();
    redemption.setReferrerUserId(referrer.getId());
    redemption.setRefereeUserId(referee.getId());
    referralRedemptionRepository.save(redemption);
  }

  @Transactional
  public void addPoints(String userId, int points) {
    User user =
        userRepository
            .findById(userId)
            .filter(User::isEnabled)
            .orElseThrow(() -> new ResourceNotFoundException("User", userId));
    user.setLoyaltyPoints(user.getLoyaltyPoints() + points);
  }

  private String generateUniqueReferralCode() {
    for (int attempt = 0; attempt < 20; attempt++) {
      String code = "PM-" + randomSuffix(6);
      if (userRepository.findByReferralCodeIgnoreCase(code).isEmpty()) {
        return code;
      }
    }
    throw new BadRequestException("Unable to generate referral code");
  }

  private String randomSuffix(int length) {
    StringBuilder builder = new StringBuilder(length);
    for (int i = 0; i < length; i++) {
      builder.append(REFERRAL_ALPHABET.charAt(RANDOM.nextInt(REFERRAL_ALPHABET.length())));
    }
    return builder.toString();
  }
}
