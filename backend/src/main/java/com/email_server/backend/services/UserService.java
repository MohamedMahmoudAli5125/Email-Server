package Email_server.Backend.services;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import Email_server.Backend.Dto.UserDTO;
import Email_server.Backend.Entities.User;
import Email_server.Backend.Repositories.UserRepository;
import Email_server.Backend.patterns.Factory;

@Service
public class UserService {
     private final UserRepository userRepository;
    
    public UserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }
    // chenck not exist before 
    // build user 
    // in user in dto we make @Email which is validation 
    @Transactional
    public User registerUser(UserDTO userDTO) {
        if (userRepository.existsByEmail(userDTO.getEmail())) {
            throw new RuntimeException("Email already exists");
        }
        // we make users without decode the passwords 
        User user = User.builder()
                .email(userDTO.getEmail())
                .name(userDTO.getName())
                .password(userDTO.getPassword()) 
                .build();
        // inbox trash ..............
        Factory.createDefaultFolders(user);
        
        return userRepository.save(user);
    }
    // login first 
    public User login(String email, String password) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Invalid credentials"));
        
        if (!user.getPassword().equals(password)) {
            throw new RuntimeException("Invalid credentials");
        }
        
        return user;
    }


    
    public User getUserById(String userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
    
    public User getUserByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }
    

    // this also we not need as we not has admin 
    // public List<User> getAllUsers() {
    //     return userRepository.findAll();
    // }
    

    // Transactional mean this method make it compact if there is any error happend return the db in orginal before enter the method 
    // and make open session to db to avoid lazy fetch 
    // use in methods which make change in db and those changes make combact 
    // we not need this but can make it as bounus to make user change its data 
    @Transactional
    public User updateUser(String userId, UserDTO userDTO) {
        User user = getUserById(userId);
        user.setName(userDTO.getName());
        return userRepository.save(user);
    }
    // this also we not need it as we not have admin make delete or ban to users i cancel it 
    // @Transactional
    // public void deleteUser(String userId) {
    //     userRepository.deleteById(userId);
    // }
}
