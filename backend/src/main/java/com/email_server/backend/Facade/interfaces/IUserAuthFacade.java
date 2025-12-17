package com.email_server.backend.Facade.interfaces;
import com.email_server.backend.Dto.UserDTO;
import com.email_server.backend.Entities.User;

public interface IUserAuthFacade {

    User registerNewUser(UserDTO userDTO);

    User authenticateUser(String email, String password);

    User getUserProfile(String userId);

    User modifyUserProfile(String userId, UserDTO updateDTO);

    void removeUserAccount(String userId);
}