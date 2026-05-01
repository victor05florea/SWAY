package sway.entity;

import java.io.Serializable;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "SWAY_Cheaters")
@Data
public class Cheater implements Serializable{

    private static final long serialVersionUID = 1L;
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "steamid")
    private Integer steamid;

    @Column(name = "ip")
    @JsonIgnore
    private String ip;

    @Column(name = "country")
    private String country;

    @Column(name = "name")
    private String name;

    @Column(name = "bhophack")
    private Integer bhophack;

    @Column(name = "gstrafehack")
    private Integer gstrafehack;

    @Column(name = "strafehack")
    private Integer strafehack;

    @Column(name = "dll")
    private Integer dll;

    @Column(name = "banned")
    private Integer banned;

    @Column(name = "date")
    private String date;

    @Column(name = "avatarurl")
    private String avatarurl;
}