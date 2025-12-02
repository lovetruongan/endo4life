package com.endo4life.service.stats;

import com.endo4life.web.rest.model.ResourceViewStatDto;
import com.endo4life.web.rest.model.UserGrowthStatDto;

import java.util.List;

public interface StatsService {
    List<UserGrowthStatDto> getUserGrowthStats(Integer days);

    List<ResourceViewStatDto> getResourceViewsStats(Integer limit, String type);
}
