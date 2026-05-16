package com.agromag.finca.services;

import com.agromag.finca.entities.Finca;
import com.agromag.finca.repositories.FincaRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class FincaService {

    private final FincaRepository fincaRepository;

    @Transactional(readOnly = true)
    public List<Finca> getAllFincas() {
        return fincaRepository.findAll();
    }

    @Transactional(readOnly = true)
    public List<Finca> getActiveFincas() {
        return fincaRepository.findByActivoTrue();
    }

    @Transactional(readOnly = true)
    public Optional<Finca> getFincaById(Long id) {
        return fincaRepository.findById(id);
    }

    public Finca createFinca(Finca finca) {
        return fincaRepository.save(finca);
    }

    public Finca updateFinca(Long id, Finca fincaDetails) {
        Optional<Finca> optionalFinca = fincaRepository.findById(id);
        if (optionalFinca.isPresent()) {
            Finca finca = optionalFinca.get();
            finca.setNombre(fincaDetails.getNombre());
            finca.setUbicacion(fincaDetails.getUbicacion());
            finca.setTamanoHectareas(fincaDetails.getTamanoHectareas());
            finca.setDescripcion(fincaDetails.getDescripcion());
            finca.setImagen(fincaDetails.getImagen());
            finca.setActivo(fincaDetails.getActivo());
            return fincaRepository.save(finca);
        }
        return null;
    }

    public boolean deleteFinca(Long id) {
        if (fincaRepository.existsById(id)) {
            fincaRepository.deleteById(id);
            return true;
        }
        return false;
    }

    public Finca toggleActive(Long id) {
        Optional<Finca> optionalFinca = fincaRepository.findById(id);
        if (optionalFinca.isPresent()) {
            Finca finca = optionalFinca.get();
            finca.setActivo(!finca.getActivo());
            return fincaRepository.save(finca);
        }
        return null;
    }
}