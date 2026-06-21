package com.pixelmart.catalog.repository;

import com.pixelmart.catalog.domain.Category;
import java.util.List;
import java.util.Optional;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CategoryRepository extends JpaRepository<Category, String> {

  boolean existsBySlug(String slug);

  Optional<Category> findBySlug(String slug);

  List<Category> findByActiveTrueOrderBySortOrderAscNameAsc();

  List<Category> findByParentIdIsNullAndActiveTrueOrderBySortOrderAscNameAsc();

  List<Category> findByParentIdIsNotNullAndActiveTrueOrderBySortOrderAscNameAsc();

  List<Category> findAllByOrderBySortOrderAscNameAsc();

  long countByParentId(String parentId);

  List<Category> findByActiveTrueAndNameContainingIgnoreCaseOrderBySortOrderAscNameAsc(
      String name, Pageable pageable);
}
