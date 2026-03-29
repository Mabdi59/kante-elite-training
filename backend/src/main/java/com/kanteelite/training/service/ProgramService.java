package com.kanteelite.training.service;

import com.kanteelite.training.dto.request.ProgramRequest;
import com.kanteelite.training.dto.response.ProgramResponse;
import com.kanteelite.training.entity.Program;
import com.kanteelite.training.exception.ResourceNotFoundException;
import com.kanteelite.training.repository.ProgramRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Arrays;
import java.util.List;

@Service
@RequiredArgsConstructor
public class ProgramService {

    private final ProgramRepository programRepository;

    public List<ProgramResponse> getAllActivePrograms() {
        return programRepository.findByActiveTrueOrderByDisplayOrderAsc()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public List<ProgramResponse> getAllPrograms() {
        return programRepository.findAll()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public ProgramResponse getProgramById(Long id) {
        Program program = programRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Program", id));
        return toResponse(program);
    }

    public ProgramResponse getProgramBySlug(String slug) {
        Program program = programRepository.findBySlugAndActiveTrue(slug)
                .orElseThrow(() -> new ResourceNotFoundException("Program not found: " + slug));
        return toResponse(program);
    }

    public Program getProgramEntityById(Long id) {
        return programRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Program", id));
    }

    @Transactional
    public ProgramResponse createProgram(ProgramRequest req) {
        Program p = Program.builder()
                .name(req.getName())
                .slug(req.getSlug())
                .description(req.getDescription())
                .shortDescription(req.getShortDescription())
                .price(req.getPrice())
                .priceLabel(req.getPriceLabel())
                .durationMinutes(req.getDurationMinutes())
                .features(req.getFeatures())
                .icon(req.getIcon())
                .whoItsFor(req.getWhoItsFor())
                .active(req.isActive())
                .displayOrder(req.getDisplayOrder() != null ? req.getDisplayOrder() : 0)
                .build();
        return toResponse(programRepository.save(p));
    }

    @Transactional
    public ProgramResponse updateProgram(Long id, ProgramRequest req) {
        Program p = programRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Program", id));
        p.setName(req.getName());
        p.setSlug(req.getSlug());
        p.setDescription(req.getDescription());
        p.setShortDescription(req.getShortDescription());
        p.setPrice(req.getPrice());
        p.setPriceLabel(req.getPriceLabel());
        p.setDurationMinutes(req.getDurationMinutes());
        p.setFeatures(req.getFeatures());
        p.setIcon(req.getIcon());
        p.setWhoItsFor(req.getWhoItsFor());
        p.setActive(req.isActive());
        if (req.getDisplayOrder() != null) p.setDisplayOrder(req.getDisplayOrder());
        return toResponse(programRepository.save(p));
    }

    @Transactional
    public void deleteProgram(Long id) {
        if (!programRepository.existsById(id)) {
            throw new ResourceNotFoundException("Program", id);
        }
        programRepository.deleteById(id);
    }

    private ProgramResponse toResponse(Program p) {
        List<String> features = p.getFeatures() != null
                ? Arrays.asList(p.getFeatures().split("\\|"))
                : List.of();
        return ProgramResponse.builder()
                .id(p.getId())
                .name(p.getName())
                .slug(p.getSlug())
                .description(p.getDescription())
                .shortDescription(p.getShortDescription())
                .price(p.getPrice())
                .priceLabel(p.getPriceLabel())
                .durationMinutes(p.getDurationMinutes())
                .features(features)
                .icon(p.getIcon())
                .whoItsFor(p.getWhoItsFor())
                .displayOrder(p.getDisplayOrder())
                .build();
    }
}
