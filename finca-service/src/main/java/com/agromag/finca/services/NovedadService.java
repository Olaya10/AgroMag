package com.agromag.finca.services;

import com.agromag.finca.entities.Novedad;
import com.agromag.finca.repositories.NovedadRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class NovedadService {

    @Autowired
    private NovedadRepository novedadRepository;

    public List<Novedad> listarPorLote(Long loteId) {
        if(loteId == null) {
            return novedadRepository.findAll();
        }
        return novedadRepository.findByLoteId(loteId);
    }

    public Novedad guardar(Novedad novedad) {
        return novedadRepository.save(novedad);
    }
}