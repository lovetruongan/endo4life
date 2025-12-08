package com.endo4life.web.rest;

import java.util.UUID;

import com.endo4life.security.RoleAccess;
import com.endo4life.web.rest.model.CreateUserRequestDto;
import com.endo4life.web.rest.model.IdWrapperDto;
import com.endo4life.web.rest.model.InviteUserRequestDto;
import com.endo4life.web.rest.model.UpdateUserRequestDto;
import com.endo4life.web.rest.model.UserInfoCriteria;
import com.endo4life.web.rest.model.UserResponsePaginatedDto;
import com.endo4life.web.rest.model.UserResponseDto;
import com.endo4life.service.user.UserInfoService;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Component;

import com.endo4life.web.rest.api.UserV1ApiDelegate;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.PathVariable;

@Component
@RequiredArgsConstructor
public class UserV1ApiDelegateImpl implements UserV1ApiDelegate {

    private final UserInfoService userInfoService;

    @Override
    @RoleAccess.UserManager // ADMIN or COORDINATOR
    public ResponseEntity<IdWrapperDto> createUser(CreateUserRequestDto createUserRequestDto) {
        var id = userInfoService.createUser(createUserRequestDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(new IdWrapperDto().id(id));
    }

    @Override
    @RoleAccess.UserManager // ADMIN or COORDINATOR
    public ResponseEntity<IdWrapperDto> inviteUser(InviteUserRequestDto inviteUserRequestDto) {
        var id = userInfoService.inviteUser(inviteUserRequestDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(new IdWrapperDto().id(id));
    }

    @Override
    @PreAuthorize("hasAuthority('ADMIN') or @securityService.isOwner(#id)")
    public ResponseEntity<Void> deleteUser(@PathVariable UUID id, String password) {
        userInfoService.deleteUser(id, password);
        return ResponseEntity.noContent().build();
    }

    @Override
    @RoleAccess.StaffOnly // ADMIN, SPECIALIST, COORDINATOR
    public ResponseEntity<UserResponsePaginatedDto> getUsers(UserInfoCriteria criteria,
            Pageable pageable) {
        var result = userInfoService.getUserByCriteria(criteria, pageable);
        return ResponseEntity.ok(
                new UserResponsePaginatedDto()
                        .total(result.getTotalElements())
                        .data(result.getContent()));
    }

    @Override
    @RoleAccess.Authenticated
    public ResponseEntity<UserResponseDto> getCurrentUserInfo() {
        UserResponseDto userResponseDto = userInfoService.getCurrentUserInfo();
        return ResponseEntity.ok(userResponseDto);
    }

    @Override
    @RoleAccess.Authenticated
    public ResponseEntity<UserResponseDto> getUserInfo() {
        UserResponseDto userResponseDto = userInfoService.getCurrentUserInfo();
        return ResponseEntity.ok(userResponseDto);
    }

    @Override
    @RoleAccess.StaffOnly // ADMIN, SPECIALIST, COORDINATOR
    public ResponseEntity<UserResponseDto> getUserById(UUID id) {
        UserResponseDto userResponseDto = userInfoService.getUserById(id);
        return ResponseEntity.ok(userResponseDto);
    }

    @Override
    @PreAuthorize("hasAuthority('ADMIN') or hasAuthority('COORDINATOR') or @securityService.isOwner(#id)")
    public ResponseEntity<Void> updateUser(UUID id, UpdateUserRequestDto dto) {
        userInfoService.updateUser(id, dto);
        return ResponseEntity.noContent().build();
    }
}
