package sway.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "SWAY_Utilities")
@Data
public class ServerUtility {
    @Id
    private Integer id;

    private Integer server; // 1, 2 sau 3
    private String name;
    private String map;
    private String players;
    private String maxplayers;
}