package com.kanteelite.training;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class KanteEliteTrainingApplication {
    public static void main(String[] args) {
        SpringApplication.run(KanteEliteTrainingApplication.class, args);
    }
}
