package com.apidoctor.dto;

public class ApiStatusDto {
    private Long id;
    private String name;
    private String url;
    private String status;
    private int responseTime;
    
    public ApiStatusDto() {}
    
    public ApiStatusDto(Long id, String name, String url, String status, int responseTime) {
        this.id = id;
        this.name = name;
        this.url = url;
        this.status = status;
        this.responseTime = responseTime;
    }
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public String getUrl() { return url; }
    public void setUrl(String url) { this.url = url; }
    
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    
    public int getResponseTime() { return responseTime; }
    public void setResponseTime(int responseTime) { this.responseTime = responseTime; }
}
