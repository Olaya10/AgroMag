package com.agromag.finca.services;

import com.agromag.finca.entities.Finca;
import com.agromag.finca.repositories.FincaRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class FincaService {

    @Autowired
    private FincaRepository fincaRepository;

    public List<Finca> getAllFincas() {
        return fincaRepository.findAll();
    }

    public List<Finca> getActiveFincas() {
        return fincaRepository.findByActivoTrue();
    }

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