package com.pixelmart.auth.repository;

import com.pixelmart.auth.domain.Role;
import com.pixelmart.auth.domain.User;
import java.util.Optional;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface UserRepository extends JpaRepository<User, String> {

  boolean existsByEmailIgnoreCase(String email);

  Optional<User> findByEmailIgnoreCase(String email);

  Optional<User> findByReferralCodeIgnoreCase(String referralCode);

  @Query(
      "SELECT u FROM User u JOIN u.roles r WHERE r = :role ORDER BY u.createdAt DESC")
  Page<User> findByRolesContaining(@Param("role") Role role, Pageable pageable);
}
