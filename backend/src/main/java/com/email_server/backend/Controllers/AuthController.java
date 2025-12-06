package Email_server.Backend.Controller;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import Email_server.Backend.Dto.UserDTO;
import Email_server.Backend.Entities.User;
import Email_server.Backend.services.UserService;
@RestController
@CrossOrigin("*")
@RequestMapping("/api/users")

public class UserController {
   
    
    private final UserService userService;
    
    public UserController(UserService userService) {
        this.userService = userService;
    }
    // i return user as you need its id i return password not very important now
    @PostMapping("/register")
    public ResponseEntity<?> register( @RequestBody UserDTO userDTO) {
        try {
            User user = userService.registerUser(userDTO);
           
            return ResponseEntity.status(HttpStatus.CREATED).body(user);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    // still i return user to his id 
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody UserDTO userDTO) {
        try {
          
            
            User user = userService.login(userDTO.getEmail(),userDTO.getPassword());
            
        
            
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("error", e.getMessage()));
        }
    }
    
    // from here we not need as this will be overhead 
    @GetMapping("/{userId}")
    public ResponseEntity<?> getUserById(@PathVariable String userId) {
        try {
            User user = userService.getUserById(userId);
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
    
    @PutMapping("/{userId}")
    public ResponseEntity<?> updateUser(@PathVariable String userId, 
                                      @RequestBody UserDTO userDTO) {
        try {
            User user = userService.updateUser(userId, userDTO);
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }
    
  
}

