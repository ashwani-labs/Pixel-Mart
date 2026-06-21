package com.pixelmart.catalog.service;

import com.pixelmart.catalog.domain.SearchEvent;
import com.pixelmart.catalog.repository.SearchEventRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class SearchEventService {

  private final SearchEventRepository searchEventRepository;

  public SearchEventService(SearchEventRepository searchEventRepository) {
    this.searchEventRepository = searchEventRepository;
  }

  @Transactional
  public void logSearch(String term, int resultCount, String sessionId) {
    if (term == null || term.trim().length() < 2) {
      return;
    }
    SearchEvent event = new SearchEvent();
    event.setTerm(term.trim().toLowerCase());
    event.setResultCount(resultCount);
    event.setSessionId(normalize(sessionId));
    searchEventRepository.save(event);
  }

  private String normalize(String value) {
    if (value == null || value.isBlank()) {
      return null;
    }
    return value.trim();
  }
}
