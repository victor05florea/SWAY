package sway.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "SWAY_JumpStats_Pre")
@Data
public class JumpStatPre {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(name = "steamid")
    private String steamid;

    @Column(name = "LJ_record")
    private Float longjump; // Le-am redenumit ca să se potrivească perfect cu React!

    @Column(name = "CJ_record")
    private Float countjump;

    @Column(name = "BJ_record")
    private Float bhop;
}