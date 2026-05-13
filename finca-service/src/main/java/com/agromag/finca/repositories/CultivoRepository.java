package com.agromag.finca.repositories;

import com.agromag.finca.entities.Cultivo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface CultivoRepository extends JpaRepository<Cultivo, Long> {
    List<Cultivo> findByActivoTrue();
    Cultivo findByNombreIgnoreCase(String nombre);
}
