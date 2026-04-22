package com.agromag.finca.repositories;

import com.agromag.finca.entities.Riego;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface RiegoRepository extends JpaRepository<Riego, Long> {
    List<Riego> findByLoteId(Long loteId);
}