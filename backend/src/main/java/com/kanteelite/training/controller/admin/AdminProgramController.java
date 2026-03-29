package com.kanteelite.training.controller.admin;

import com.kanteelite.training.dto.request.ProgramRequest;
import com.kanteelite.training.dto.response.ApiResponse;
import com.kanteelite.training.dto.response.ProgramResponse;
import com.kanteelite.training.service.ProgramService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/programs")
@RequiredArgsConstructor
public class AdminProgramController {

    private final ProgramService programService;

    @GetMapping
    public ResponseEntity<ApiResponse<List<ProgramResponse>>> getAllPrograms() {
        return ResponseEntity.ok(ApiResponse.success(programService.getAllPrograms()));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<ProgramResponse>> createProgram(@Valid @RequestBody ProgramRequest request) {
        ProgramResponse created = programService.createProgram(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ApiResponse.success("Program created.", created));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<ProgramResponse>> updateProgram(
            @PathVariable Long id, @Valid @RequestBody ProgramRequest request) {
        return ResponseEntity.ok(ApiResponse.success("Program updated.", programService.updateProgram(id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteProgram(@PathVariable Long id) {
        programService.deleteProgram(id);
        return ResponseEntity.ok(ApiResponse.success("Program deleted.", null));
    }
}
