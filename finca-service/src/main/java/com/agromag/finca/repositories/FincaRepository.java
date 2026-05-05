package com.agromag.finca.repositories;

import com.agromag.finca.entities.Finca;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FincaRepository extends JpaRepository<Finca, Long> {
    List<Finca> findByActivoTrue();
}