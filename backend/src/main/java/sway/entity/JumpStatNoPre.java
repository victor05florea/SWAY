package sway.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "SWAY_JumpStats_NoPre")
@Data
public class JumpStatNoPre {

    @Id
    @Column(name = "steamid")
    private String steamid;

    @Column(name = "LJ_record")
    private Float longjump;

    @Column(name = "CJ_record")
    private Float countjump;

    @Column(name = "BJ_record")
    private Float bhop;
}