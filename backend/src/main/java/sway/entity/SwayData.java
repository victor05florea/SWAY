package sway.entity;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name="SWAY_Data")
@Data
public class SwayData {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, unique = true)
    private Integer steamid;

    @Column(length = 32)
    private String ip;

    @Column(length = 3)
    private String country;

    @Column(length = 64)
    private String name;

    @Column(length = 64)
    private String firstname;

    @Column(length = 32)
    private String admin;

    @Column(length = 128)
    private String features;

    private Integer vip;
    private Integer connects;
    private Integer time;
    private Integer weektime;

    //Core stats
    private Integer kills;
    private Integer assists;
    private Integer deaths;
    private Integer bounty;

    //Penalties
    private Integer gag;
    private Integer mute;
    private Integer ban;

    @Column(length = 128)
    private String banreason;

    private Integer unbannotify;
    private Integer slaywarns;
    private Integer lastslaywarn;

    //Jump stats
    private Integer jumps;
    private Integer ducks;
    private Integer ownages;
    private Integer wreckers;

    @Column(length = 128)
    private String immunities;

    @Column(name = "avatarurl", length = 128)
    private String avatarUrl;

    //Preferences
    @Column(name = "pref_toggleknife")
    private Integer prefToggleKnife;
    @Column(name = "pref_sound")
    private Boolean prefSound; // tinyint(1) devine Boolean în Java
    @Column(name = "pref_hitsound")
    private Boolean prefHitSound;
    @Column(name = "pref_hideteam")
    private Boolean prefHideTeam;
    @Column(name = "pref_clantag")
    private Integer prefClanTag;
    @Column(name = "pref_speccolor")
    private Integer prefSpecColor;
    @Column(name = "pref_beamcolor")
    private Integer prefBeamColor;
    @Column(name = "pref_pin")
    private Integer prefPin;
    @Column(name = "pref_icon")
    private Integer prefIcon;
    @Column(name = "pref_rankicon")
    private Integer prefRankIcon;
    @Column(name = "pref_fov")
    private Integer prefFov;
    @Column(name = "pref_skybox")
    private Integer prefSkybox;
    @Column(name = "pref_flashcolor")
    private Boolean prefFlashColor;
    @Column(name = "pref_spawneffect")
    private Integer prefSpawnEffect;
    @Column(name = "pref_gasnades")
    private Boolean prefGasNades;
    @Column(name = "pref_speclist")
    private Boolean prefSpecList;
    @Column(name = "pref_noclipkey")
    private Boolean prefNoclipKey;
    @Column(name = "pref_knifect")
    private Boolean prefKnifeCt;
    @Column(name = "pref_jssounds")
    private Boolean prefJsSounds;
    @Column(name = "pref_speedtype")
    private Integer prefSpeedType;
    @Column(name = "pref_colorchat")
    private Integer prefColorChat;
    @Column(name = "pref_speedcolor")
    private Integer prefSpeedColor;
    @Column(name = "pref_speedy")
    private Float prefSpeedy;
    @Column(name = "pref_syncstats")
    private Boolean prefSyncStats;

    //Mix stats
    private Integer mixgames;
    private Integer mixwon;
    private Integer mixtotaltime;
    private Integer mixtotalstabs;
    private Integer mixdisconnects;
    private Integer mixtotalfalldmg;
    private Integer mixelo;


    @Transient
    private JumpStatPre jumpStatsPre;

    @Transient
    private JumpStatNoPre jumpStatsNoPre;

    // Getter inteligent: lasă variabila Integer, dar trimite un String către Controller
    public String getSteamId() {
        if (this.steamid == null) {
            return null;
        }
        // String.valueOf() este varianta antiglonț a lui .toString()
        return String.valueOf(this.steamid);
    }

    public void setJumpStatsPre(JumpStatPre jumpStatsPre) {
        this.jumpStatsPre = jumpStatsPre;
    }

    // Setter pentru datele NOPRE (Asta rezolvă eroarea ta!)
    public void setJumpStatsNoPre(JumpStatNoPre jumpStatsNoPre) {
        this.jumpStatsNoPre = jumpStatsNoPre;
    }
}
