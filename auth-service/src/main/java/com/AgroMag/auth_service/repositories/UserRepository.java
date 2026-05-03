package com.AgroMag.auth_service.repositories;

import com.AgroMag.auth_service.entities.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {
    Optional<User> findByEmail(String email);
    
    @Query("SELECT u FROM User u WHERE LOWER(u.name) LIKE LOWER(CONCAT('%', :criterio, '%')) OR CAST(u.cedula AS string) LIKE CONCAT('%', :criterio, '%')")
    List<User> buscarUsuarios(@Param("criterio") String criterio);
}