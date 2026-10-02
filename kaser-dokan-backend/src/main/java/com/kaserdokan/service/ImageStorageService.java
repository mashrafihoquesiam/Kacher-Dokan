package com.kaserdokan.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.io.*;
import java.net.URI;
import java.net.http.*;
import java.nio.charset.StandardCharsets;
import java.nio.file.*;
import java.security.MessageDigest;
import java.time.Instant;
import java.util.*;
import java.util.regex.*;

@Service
public class ImageStorageService {
    @Value("${kacher.cloudinary-url:}") private String cloudinaryUrl;
    private final Path uploadRoot = Paths.get("uploads");

    public String provider(){ return cloudinaryUrl != null && cloudinaryUrl.startsWith("cloudinary://") ? "cloudinary" : "local-fallback"; }

    public String save(String dataUrl, String kind) throws Exception {
        ParsedImage parsed = parse(dataUrl);
        Cloud cloud = cloud();
        if (cloud != null) return uploadCloudinary(parsed.dataUrl, cloud, kind);
        String dir = "product".equals(kind) ? "products" : "profiles";
        Path targetDir = uploadRoot.resolve(dir); Files.createDirectories(targetDir);
        String filename = kind + "-" + System.currentTimeMillis() + "-" + UUID.randomUUID().toString().substring(0,8) + "." + parsed.ext;
        Files.write(targetDir.resolve(filename), parsed.bytes);
        return "/uploads/" + dir + "/" + filename;
    }


    public String savePrivateRiderDocument(String dataUrl, String prefix) throws Exception {
        String raw=Objects.toString(dataUrl,"");
        Matcher m=Pattern.compile("^data:(image/(png|jpeg|jpg|webp)|application/pdf);base64,([A-Za-z0-9+/=]+)$").matcher(raw);
        if(!m.matches()) throw new IllegalArgumentException("Rider document must be PNG, JPG, WEBP, or PDF.");
        byte[] bytes=Base64.getDecoder().decode(m.group(3));
        if(bytes.length==0||bytes.length>6*1024*1024) throw new IllegalArgumentException("Rider document must be smaller than 6 MB.");
        String mime=m.group(1); String ext="application/pdf".equals(mime)?"pdf":("jpeg".equals(m.group(2))?"jpg":m.group(2));
        Path targetDir=Paths.get("private_uploads","rider-documents"); Files.createDirectories(targetDir);
        String filename=prefix+"-"+System.currentTimeMillis()+"-"+UUID.randomUUID().toString().substring(0,8)+"."+ext;
        Files.write(targetDir.resolve(filename),bytes);
        return filename;
    }

    private String uploadCloudinary(String dataUrl, Cloud c, String kind) throws Exception {
        long ts = Instant.now().getEpochSecond();
        String folder = "kacher-dokan/" + ("product".equals(kind)?"products":"profiles");
        String sigBase = "folder="+folder+"&timestamp="+ts+c.secret;
        String signature = sha1(sigBase);
        String boundary = "----KD" + UUID.randomUUID();
        ByteArrayOutputStream out = new ByteArrayOutputStream();
        field(out,boundary,"file",dataUrl); field(out,boundary,"api_key",c.key); field(out,boundary,"timestamp",String.valueOf(ts)); field(out,boundary,"folder",folder); field(out,boundary,"signature",signature);
        out.write(("--"+boundary+"--\r\n").getBytes(StandardCharsets.UTF_8));
        HttpRequest req = HttpRequest.newBuilder(URI.create("https://api.cloudinary.com/v1_1/"+c.cloud+"/image/upload"))
                .header("Content-Type","multipart/form-data; boundary="+boundary).POST(HttpRequest.BodyPublishers.ofByteArray(out.toByteArray())).build();
        HttpResponse<String> resp = HttpClient.newHttpClient().send(req,HttpResponse.BodyHandlers.ofString());
        if(resp.statusCode()<200||resp.statusCode()>=300) throw new IOException("Cloudinary upload failed: "+resp.body());
        Matcher m=Pattern.compile("\\\"secure_url\\\"\\s*:\\s*\\\"([^\\\"]+)\\\"").matcher(resp.body());
        if(!m.find()) throw new IOException("Cloudinary did not return secure_url");
        return m.group(1).replace("\\/","/");
    }
    private static void field(ByteArrayOutputStream out,String b,String name,String value)throws IOException{
        out.write(("--"+b+"\r\nContent-Disposition: form-data; name=\""+name+"\"\r\n\r\n"+value+"\r\n").getBytes(StandardCharsets.UTF_8));
    }
    private Cloud cloud(){ try { if(cloudinaryUrl==null||!cloudinaryUrl.startsWith("cloudinary://"))return null; URI u=URI.create(cloudinaryUrl); String[] ui=u.getUserInfo().split(":",2); return new Cloud(u.getHost(),ui[0],ui[1]); } catch(Exception e){return null;} }
    private ParsedImage parse(String dataUrl){
        Matcher m=Pattern.compile("^data:image/(png|jpeg|jpg|webp);base64,([A-Za-z0-9+/=]+)$").matcher(Objects.toString(dataUrl,""));
        if(!m.matches()) throw new IllegalArgumentException("Please select a PNG, JPG or WEBP image.");
        byte[] bytes=Base64.getDecoder().decode(m.group(2)); if(bytes.length==0||bytes.length>4*1024*1024) throw new IllegalArgumentException("Image must be smaller than 4 MB.");
        String ext="jpeg".equals(m.group(1))?"jpg":m.group(1); return new ParsedImage(ext,bytes,dataUrl);
    }
    private static String sha1(String s)throws Exception{ MessageDigest md=MessageDigest.getInstance("SHA-1"); byte[] b=md.digest(s.getBytes(StandardCharsets.UTF_8)); StringBuilder sb=new StringBuilder(); for(byte x:b)sb.append(String.format("%02x",x)); return sb.toString(); }
    private record Cloud(String cloud,String key,String secret){} private record ParsedImage(String ext,byte[] bytes,String dataUrl){}
}
