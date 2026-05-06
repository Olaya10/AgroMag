package com.agromag.finca.services;

import com.agromag.finca.entities.Lote;
import com.agromag.finca.entities.Cultivo;
import com.agromag.finca.entities.Finca;
import com.agromag.finca.repositories.LoteRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class LoteService {

    @Autowired
    private LoteRepository loteRepository;

    @Autowired
    private CultivoService cultivoService;

    @Autowired
    private FincaService fincaService;

    public List<Lote> listarPorLote() {
        return loteRepository.findAll();
    }

    public Lote guardar(Lote lote) throws Exception {
        if (lote.getFinca() == null || lote.getFinca().getId() == null) {
            throw new Exception("Debe asignar una finca al lote");
        }
        if (lote.getCultivo() == null || lote.getCultivo().getId() == null) {
            throw new Exception("Debe asignar un cultivo al lote");
        }
        
        Finca finca = fincaService.getFincaById(lote.getFinca().getId())
                .orElseThrow(() -> new Exception("Finca no encontrada"));
        lote.setFinca(finca);
        
        Cultivo cultivo = cultivoService.obtenerPorId(lote.getCultivo().getId());
        lote.setCultivo(cultivo);
        
        validarExtensionContraFinca(lote);
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
        lote.setExtensionHectareas(detalles.getExtensionHectareas());
        lote.setCoordenadas(detalles.getCoordenadas());
        lote.setEtapaDesarrollo(detalles.getEtapaDesarrollo());
        lote.setObservaciones(detalles.getObservaciones());
        
        if (detalles.getImagen() != null) {
            lote.setImagen(detalles.getImagen());
        }
        
        if (detalles.getCultivo() != null && detalles.getCultivo().getId() != null) {
            Cultivo cultivo = cultivoService.obtenerPorId(detalles.getCultivo().getId());
            lote.setCultivo(cultivo);
        }
        
        if (detalles.getFinca() != null && detalles.getFinca().getId() != null) {
            Finca finca = fincaService.getFincaById(detalles.getFinca().getId())
                    .orElseThrow(() -> new Exception("Finca no encontrada"));
            lote.setFinca(finca);
        }

        validarExtensionContraFinca(lote);
        return loteRepository.save(lote);
    }

    public void eliminarLote(Long id) throws Exception {
        Lote lote = loteRepository.findById(id)
                .orElseThrow(() -> new Exception("Lote no encontrado"));
        loteRepository.delete(lote);
    }

    private void validarExtensionContraFinca(Lote lote) throws Exception {
        if (lote.getExtensionHectareas() == null || lote.getExtensionHectareas() <= 0) {
            throw new Exception("La extensión del lote debe ser mayor que 0");
        }
        if (lote.getFinca() == null || lote.getFinca().getTamanoHectareas() == null) {
            throw new Exception("No se puede validar la extensión del lote sin una finca válida");
        }
        if (lote.getExtensionHectareas() > lote.getFinca().getTamanoHectareas()) {
            throw new Exception("La extensión del lote no puede superar el tamaño de la finca (" + lote.getFinca().getTamanoHectareas() + " ha)");
        }
    }
}