package sway.entity;

import java.io.Serializable;
import jakarta.persistence.*;
import lombok.Data;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonIgnore;

@Entity
@Table(name="SWAY_Data")
@Data
public class SwayData implements Serializable {

    private static final long serialVersionUID = 1L;
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Integer id;

    @Column(nullable = false, unique = true)
    private Integer steamid;

    @JsonIgnore
    @Column(length = 32)
    private String ip;

    @Column(length = 3)
    private String country;

    @Column(length = 64)
    private String name;

    @JsonIgnore
    @Column(length = 64)
    private String firstname;

    @Column(length = 32)
    private String admin;

    @JsonIgnore
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
    @JsonIgnore
    private Integer bounty;

    //Penalties
    @JsonIgnore
    private Integer gag;
    @JsonIgnore
    private Integer mute;
    @JsonIgnore
    private Integer ban;

    @JsonIgnore
    @Column(length = 128)
    private String banreason;

    @JsonIgnore
    private Integer unbannotify;
    @JsonIgnore
    private Integer slaywarns;
    @JsonIgnore
    private Integer lastslaywarn;

    //Jump stats
    private Integer jumps;
    private Integer ducks;

    private Integer ownages;
    private Integer wreckers;

    @JsonIgnore
    @Column(length = 128)
    private String immunities;

    @Column(name = "avatarurl", length = 128)
    private String avatarUrl;

    //Preferences
    @JsonIgnore
    @Column(name = "pref_toggleknife")
    private Integer prefToggleKnife;
    @JsonIgnore
    @Column(name = "pref_sound")
    private Boolean prefSound;
    @JsonIgnore
    @Column(name = "pref_hitsound")
    private Boolean prefHitSound;
    @JsonIgnore
    @Column(name = "pref_hideteam")
    private Boolean prefHideTeam;
    @JsonIgnore
    @Column(name = "pref_clantag")
    private Integer prefClanTag;
    @JsonIgnore
    @Column(name = "pref_speccolor")
    private Integer prefSpecColor;
    @JsonIgnore
    @Column(name = "pref_beamcolor")
    private Integer prefBeamColor;
    @JsonIgnore
    @Column(name = "pref_pin")
    private Integer prefPin;
    @JsonIgnore
    @Column(name = "pref_icon")
    private Integer prefIcon;
    @JsonIgnore
    @Column(name = "pref_rankicon")
    private Integer prefRankIcon;
    @JsonIgnore
    @Column(name = "pref_fov")
    private Integer prefFov;
    @JsonIgnore
    @Column(name = "pref_skybox")
    private Integer prefSkybox;
    @JsonIgnore
    @Column(name = "pref_flashcolor")
    private Boolean prefFlashColor;
    @JsonIgnore
    @Column(name = "pref_spawneffect")
    private Integer prefSpawnEffect;
    @JsonIgnore
    @Column(name = "pref_gasnades")
    private Boolean prefGasNades;
    @JsonIgnore
    @Column(name = "pref_speclist")
    private Boolean prefSpecList;
    @JsonIgnore
    @Column(name = "pref_noclipkey")
    private Boolean prefNoclipKey;
    @JsonIgnore
    @Column(name = "pref_knifect")
    private Boolean prefKnifeCt;
    @JsonIgnore
    @Column(name = "pref_jssounds")
    private Boolean prefJsSounds;
    @JsonIgnore
    @Column(name = "pref_speedtype")
    private Integer prefSpeedType;
    @JsonIgnore
    @Column(name = "pref_colorchat")
    private Integer prefColorChat;
    @JsonIgnore
    @Column(name = "pref_speedcolor")
    private Integer prefSpeedColor;
    @JsonIgnore
    @Column(name = "pref_speedy")
    private Float prefSpeedy;
    @JsonIgnore
    @Column(name = "pref_syncstats")
    private Boolean prefSyncStats;

    private Integer mixgames;
    private Integer mixwon;
    private Integer mixtotaltime;
    private Integer mixtotalstabs;
    private Integer mixdisconnects;
    private Integer mixtotalfalldmg;
    private Integer mixelo;


    @Transient
    @JsonProperty("jumpStatsPre")
    private JumpStatPre jumpStatsPre;

    @Transient
    @JsonProperty("jumpStatsNoPre")
    private JumpStatNoPre jumpStatsNoPre;

    // Getter inteligent: lasă variabila Integer, dar trimite un String către Controller
    public String getSteamId() { // cu "I" mare
        return (this.steamid == null) ? null : String.valueOf(this.steamid);
    }

    public void setJumpStatsPre(JumpStatPre jumpStatsPre) {
        this.jumpStatsPre = jumpStatsPre;
    }
    public void setJumpStatsNoPre(JumpStatNoPre jumpStatsNoPre) {
        this.jumpStatsNoPre = jumpStatsNoPre;
    }
    public JumpStatPre getJumpStatsPre() {
        return this.jumpStatsPre;
    }
    public JumpStatNoPre getJumpStatsNoPre() {
        return this.jumpStatsNoPre;
    }


    @Transient
    private Integer serverRank;

    public Integer getServerRank() {
        return serverRank;
    }

    public void setServerRank(Integer serverRank) {
        this.serverRank = serverRank;
    }


}
