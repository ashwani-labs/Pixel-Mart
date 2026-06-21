package com.pixelmart.catalog.repository;

import com.pixelmart.catalog.domain.SearchEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.Instant;
import java.util.List;

public interface SearchEventRepository extends JpaRepository<SearchEvent, String> {

  @Query(
      value =
          """
          SELECT term, COUNT(*) AS cnt
          FROM search_events
          WHERE created_at >= :since
          GROUP BY term
          ORDER BY cnt DESC
          LIMIT :limit
          """,
      nativeQuery = true)
  List<Object[]> topTermsSince(@Param("since") Instant since, @Param("limit") int limit);
}
