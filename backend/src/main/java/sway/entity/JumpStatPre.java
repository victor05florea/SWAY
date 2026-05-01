package sway.entity;

import jakarta.persistence.*;
import lombok.Data;
import java.io.Serializable;

@Entity
@Table(name = "SWAY_JumpStats_Pre")
@Data
public class JumpStatPre implements Serializable{

    private static final long serialVersionUID = 1L;
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

    @Column(name = "LJ_strafes") private Integer ljStrafes;
    @Column(name = "LJ_pre") private Float ljPre;
    @Column(name = "LJ_max") private Float ljMax;
    @Column(name = "LJ_height") private Float ljHeight;
    @Column(name = "LJ_sync") private Float ljSync;

    @Column(name = "CJ_strafes") private Integer cjStrafes;
    @Column(name = "CJ_pre") private Float cjPre;
    @Column(name = "CJ_max") private Float cjMax;
    @Column(name = "CJ_height") private Float cjHeight;
    @Column(name = "CJ_sync") private Float cjSync;

    @Column(name = "BJ_strafes") private Integer bjStrafes;
    @Column(name = "BJ_pre") private Float bjPre;
    @Column(name = "BJ_max") private Float bjMax;
    @Column(name = "BJ_height") private Float bjHeight;
    @Column(name = "BJ_sync") private Float bjSync;

    @Column(name = "WJ_record") private Float wjRecord;
    @Column(name = "WJ_strafes") private Integer wjStrafes;
    @Column(name = "WJ_pre") private Float wjPre;
    @Column(name = "WJ_max") private Float wjMax;
    @Column(name = "WJ_height") private Float wjHeight;
    @Column(name = "WJ_sync") private Float wjSync;

    @Column(name = "LAJ_record") private Float lajRecord;
    @Column(name = "LAJ_strafes") private Integer lajStrafes;
    @Column(name = "LAJ_pre") private Float lajPre;
    @Column(name = "LAJ_max") private Float lajMax;
    @Column(name = "LAJ_height") private Float lajHeight;
    @Column(name = "LAJ_sync") private Float lajSync;

    @Column(name = "DBJ_record") private Float dsbjRecord;
    @Column(name = "DBJ_strafes") private Integer dsbjStrafes;
    @Column(name = "DBJ_pre") private Float dsbjPre;
    @Column(name = "DBJ_max") private Float dsbjMax;
    @Column(name = "DBJ_height") private Float dsbjHeight;
    @Column(name = "DBJ_sync") private Float dsbjSync;

    @Column(name = "LJB_record") private Float lbrRecord;
    @Column(name = "LJB_strafes") private Integer lbrStrafes;
    @Column(name = "LJB_pre") private Float lbrPre;
    @Column(name = "LJB_max") private Float lbrMax;
    @Column(name = "LJB_height") private Float lbrHeight;
    @Column(name = "LJB_sync") private Float lbrSync;
}