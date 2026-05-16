package com.agromag.finca.services;

import com.agromag.finca.entities.Riego;
import com.agromag.finca.repositories.RiegoRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
@RequiredArgsConstructor
public class RiegoService {

    private final RiegoRepository riegoRepository;

    public List<Riego> listarPorLote(Long loteId) {
        if (loteId == null) {
            return riegoRepository.findAll();
        }
        return riegoRepository.findByLoteId(loteId);
    }

    public Riego registrar(Riego riego) {
        return riegoRepository.save(riego);
    }

    public void eliminarRiego(Long id) {
        riegoRepository.deleteById(id);
    }

    public Riego buscarPorId(Long id) {
        return riegoRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Registro de riego no encontrado"));
    }
}