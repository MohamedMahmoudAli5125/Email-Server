package com.email_server.backend.Facade.implementations;
import com.email_server.backend.Dto.UserDTO;
import com.email_server.backend.Entities.User;
import com.email_server.backend.Facade.interfaces.IUserAuthFacade;
import com.email_server.backend.Services.UserService;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
@Component
public class UserAuthFacade implements IUserAuthFacade {

    private final UserService userService;

    public UserAuthFacade(UserService userService) {
        this.userService = userService;
    }

    @Override
    @Transactional
    public User registerNewUser(UserDTO userDTO) {
        return userService.signup(userDTO);
    }

    @Override
    public User authenticateUser(String email, String password) {
        return userService.login(email, password);
    }

    @Override
    public User getUserProfile(String userId) {
        return userService.getUserById(userId);
    }

    @Override
    @Transactional
    public User modifyUserProfile(String userId, UserDTO updateDTO) {
        return userService.updateUser(userId, updateDTO);
    }

    @Override
    @Transactional
    public void removeUserAccount(String userId) {
        userService.deleteUser(userId);
    }
}