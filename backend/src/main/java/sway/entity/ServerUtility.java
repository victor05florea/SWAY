package sway.entity;

import java.io.Serializable;
import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "SWAY_Utilities")
@Data
public class ServerUtility implements Serializable{

    private static final long serialVersionUID = 1L;
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    private Integer server;
    private String name;
    private String map;
    private String players;
    private String maxplayers;

    // Format așteptat: "ro|crash|123456789;en|john|987654321"
    private String terrorists;

    @Column(name = "counterterrorists") // Ne asigurăm că mapează exact numele din SQL
    private String counterterrorists;

    private String spectators;
    private String funjumpers;

    private String serverip; // IP-ul a fost adăugat direct în baza de date!
}