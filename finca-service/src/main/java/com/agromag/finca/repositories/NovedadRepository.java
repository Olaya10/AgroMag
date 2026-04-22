package com.agromag.finca.repositories;

import com.agromag.finca.entities.Novedad;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface NovedadRepository extends JpaRepository<Novedad, Long> {
    List<Novedad> findByLoteId(Long loteId);
}