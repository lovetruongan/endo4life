package com.endo4life.service.stats;

import com.endo4life.repository.ResourceRepository;
import com.endo4life.repository.UserInfoRepository;
import com.endo4life.web.rest.model.ResourceViewStatDto;
import com.endo4life.web.rest.model.UserGrowthStatDto;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StatsServiceImpl implements StatsService {

    private final UserInfoRepository userInfoRepository;
    private final ResourceRepository resourceRepository;

    @Override
    @Transactional(readOnly = true)
    public List<UserGrowthStatDto> getUserGrowthStats(Integer days) {
        int daysToFetch = days != null ? days : 30;
        LocalDateTime startDate = LocalDateTime.now().minusDays(daysToFetch);

        // Get all users created after start date
        List<Object[]> userCounts = userInfoRepository.countUsersByDate(startDate);

        // Create a map of date -> count
        Map<LocalDate, Long> countMap = userCounts.stream()
                .collect(Collectors.toMap(
                        row -> ((java.sql.Date) row[0]).toLocalDate(),
                        row -> ((Number) row[1]).longValue()));

        // Get total users before start date for cumulative calculation
        long cumulativeCount = userInfoRepository.countUsersCreatedBefore(startDate);

        List<UserGrowthStatDto> result = new ArrayList<>();
        LocalDate currentDate = startDate.toLocalDate();
        LocalDate endDate = LocalDate.now();

        while (!currentDate.isAfter(endDate)) {
            long dailyCount = countMap.getOrDefault(currentDate, 0L);
            cumulativeCount += dailyCount;

            UserGrowthStatDto stat = new UserGrowthStatDto();
            stat.setDate(currentDate);
            stat.setCount((int) dailyCount);
            stat.setCumulativeCount((int) cumulativeCount);
            result.add(stat);

            currentDate = currentDate.plusDays(1);
        }

        return result;
    }

    @Override
    @Transactional(readOnly = true)
    public List<ResourceViewStatDto> getResourceViewsStats(Integer limit, String type) {
        int limitCount = limit != null ? limit : 10;

        List<Object[]> topResources;
        if (type != null && !type.isEmpty()) {
            topResources = resourceRepository.findTopViewedResourcesByType(type, limitCount);
        } else {
            topResources = resourceRepository.findTopViewedResources(limitCount);
        }

        return topResources.stream()
                .map(row -> {
                    ResourceViewStatDto dto = new ResourceViewStatDto();
                    dto.setId(java.util.UUID.fromString(row[0].toString()));
                    dto.setTitle((String) row[1]);
                    dto.setType((String) row[2]);
                    dto.setViewCount(((Number) row[3]).intValue());
                    dto.setThumbnailUrl((String) row[4]);
                    return dto;
                })
                .collect(Collectors.toList());
    }
}
