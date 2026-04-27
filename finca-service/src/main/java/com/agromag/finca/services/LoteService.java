package com.agromag.finca.services;

import com.agromag.finca.entities.Lote;
import com.agromag.finca.repositories.LoteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class LoteService {

    @Autowired
    private LoteRepository loteRepository;

    public List<Lote> listarPorLote() {
        return loteRepository.findAll();
    }

    public Lote guardar(Lote lote) {
        return loteRepository.save(lote);
    }

    public Lote actualizarEtapa(Long id, String nuevaEtapa) throws Exception {
        Lote lote = loteRepository.findById(id)
                .orElseThrow(() -> new Exception("Lote no encontrado"));

        lote.setEtapaDesarrollo(nuevaEtapa.toUpperCase());
        return loteRepository.save(lote);
    }

    public Lote actualizar(Long id, Lote detalles) throws Exception {
        Lote lote = loteRepository.findById(id)
                .orElseThrow(() -> new Exception("Lote no encontrado"));

        lote.setNombre(detalles.getNombre());
        lote.setTipoCultivo(detalles.getTipoCultivo());
        lote.setExtensionHectareas(detalles.getExtensionHectareas());
        lote.setCoordenadas(detalles.getCoordenadas());
        lote.setEtapaDesarrollo(detalles.getEtapaDesarrollo());

        return loteRepository.save(lote);
    }

    public void eliminarLote(Long id) throws Exception {
        Lote lote = loteRepository.findById(id)
                .orElseThrow(() -> new Exception("Lote no encontrado"));
        loteRepository.delete(lote);
    }
}