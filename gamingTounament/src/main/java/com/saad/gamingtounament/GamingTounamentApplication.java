package com.saad.gamingtounament;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@SpringBootApplication
@RestController
public class GamingTounamentApplication {

    public static void main(String[] args) {
        SpringApplication.run(GamingTounamentApplication.class, args);
    }
@GetMapping("/")
    public String apiRoot()
{
    return "hello";
}
}
