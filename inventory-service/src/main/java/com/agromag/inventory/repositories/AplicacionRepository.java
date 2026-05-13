package com.agromag.inventory.repositories;

import com.agromag.inventory.entities.Aplicacion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AplicacionRepository extends JpaRepository<Aplicacion, Long> {
    List<Aplicacion> findByLoteId(Long loteId);
}