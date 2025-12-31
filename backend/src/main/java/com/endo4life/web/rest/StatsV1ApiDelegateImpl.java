package com.endo4life.web.rest;

import com.endo4life.security.RoleAccess;
import com.endo4life.service.stats.StatsService;
import com.endo4life.web.rest.api.StatsV1ApiDelegate;
import com.endo4life.web.rest.model.ResourceViewStatDto;
import com.endo4life.web.rest.model.UserGrowthStatDto;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
public class StatsV1ApiDelegateImpl implements StatsV1ApiDelegate {

    private final StatsService statsService;

    @Override
    @RoleAccess.StaffOnly // ADMIN, SPECIALIST, COORDINATOR - Dashboard stats
    public ResponseEntity<List<UserGrowthStatDto>> getUserGrowthStats(Integer days) {
        return ResponseEntity.ok(statsService.getUserGrowthStats(days));
    }

    @Override
    @RoleAccess.StaffOnly // ADMIN, SPECIALIST, COORDINATOR - Dashboard stats
    public ResponseEntity<List<ResourceViewStatDto>> getResourceViewsStats(Integer limit, String type) {
        return ResponseEntity.ok(statsService.getResourceViewsStats(limit, type));
    }
}
