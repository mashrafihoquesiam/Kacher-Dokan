package com.kaserdokan.service;

import com.mongodb.client.MongoCollection;
import com.mongodb.client.model.*;
import org.bson.Document;
import org.bson.types.ObjectId;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.*;

@Service
public class KaserDokanService {
    public final MongoTemplate mongo;
    public final RealtimeService realtime;
    public final String dbName;
    public KaserDokanService(MongoTemplate mongo, RealtimeService realtime, @Value("${spring.data.mongodb.database:kaser_dokan}") String dbName){ this.mongo=mongo; this.realtime=realtime; this.dbName=dbName; }
    public MongoCollection<Document> c(String name){ return mongo.getCollection(name); }
    public static ObjectId oid(Object value){ try{return value instanceof ObjectId o?o:new ObjectId(String.valueOf(value));}catch(Exception e){return null;} }
    public static String s(Object v){ return v==null?"":String.valueOf(v); }
    public static double d(Object v,double def){ try{return Double.parseDouble(String.valueOf(v));}catch(Exception e){return def;} }
    public static int i(Object v,int def){ try{return Integer.parseInt(String.valueOf(v));}catch(Exception e){return def;} }
    public static boolean b(Object v,boolean def){ if(v==null)return def; if(v instanceof Boolean x)return x; return Boolean.parseBoolean(String.valueOf(v)); }
    public static Date now(){ return Date.from(Instant.now()); }
    public static Map<String,Object> ok(){ return new LinkedHashMap<>(Map.of("success",true)); }
    public static Map<String,Object> resp(boolean success,String message){ Map<String,Object> m=new LinkedHashMap<>();m.put("success",success);m.put("message",message);return m; }
    public static Object json(Object v){
        if(v instanceof ObjectId o)return o.toHexString();
        if(v instanceof Document d){ Map<String,Object> m=new LinkedHashMap<>(); for(var e:d.entrySet())m.put(e.getKey(),json(e.getValue())); return m; }
        if(v instanceof Map<?,?> map){ Map<String,Object> m=new LinkedHashMap<>(); for(var e:map.entrySet())m.put(String.valueOf(e.getKey()),json(e.getValue())); return m; }
        if(v instanceof List<?> l){ List<Object> out=new ArrayList<>(); for(Object x:l)out.add(json(x)); return out; }
        return v;
    }
    public List<ObjectId> ownedShopIds(String userId){ ObjectId uid=oid(userId); if(uid==null)return List.of(); return c("shops").find(Filters.eq("ownerId",uid)).map(d->d.getObjectId("_id")).into(new ArrayList<>()); }
    public boolean ownsShop(String userId,ObjectId shopId){ return ownedShopIds(userId).stream().anyMatch(x->x.equals(shopId)); }
    public boolean canAccessOrder(Map<String,Object> auth,Document order){
        if(auth==null||order==null)return false; String role=s(auth.get("role")), sub=s(auth.get("sub"));
        if("USER".equals(role))return Objects.equals(s(order.get("userId")),sub);
        if("SHOP_OWNER".equals(role)){ ObjectId sid=order.getObjectId("shopId"); return sid!=null&&ownsShop(sub,sid); }
        if("RIDER".equals(role))return Objects.equals(s(order.get("acceptedRiderId")),sub);
        return false;
    }
    public Document notifyUser(Object userId,String type,String title,String message,Map<String,Object> meta){
        ObjectId uid=oid(userId); if(uid==null)return null; Document n=new Document("_id",new ObjectId()).append("userId",uid).append("type",type).append("title",title).append("message",message).append("meta",meta==null?Map.of():meta).append("read",false).append("createdAt",now()); c("notifications").insertOne(n); realtime.user(uid.toHexString(),"notification:action",json(n)); return n;
    }
    public static double distanceMeters(Document shop,double lat,double lng){
        try{ Document loc=(Document)shop.get("location"); List<?> co=(List<?>)loc.get("coordinates"); double lon=((Number)co.get(0)).doubleValue(), la=((Number)co.get(1)).doubleValue(); double R=6371000, p1=Math.toRadians(lat),p2=Math.toRadians(la),dp=Math.toRadians(la-lat),dl=Math.toRadians(lon-lng); double a=Math.sin(dp/2)*Math.sin(dp/2)+Math.cos(p1)*Math.cos(p2)*Math.sin(dl/2)*Math.sin(dl/2); return R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a)); }catch(Exception e){return Double.MAX_VALUE;}
    }
    public String defaultProductImage(Document p){ String h=(s(p.get("name"))+" "+s(p.get("nameBn"))+" "+s(p.get("category"))).toLowerCase(); String[][] x={{"milk|দুধ|dairy","milk"},{"oil|তেল","oil"},{"chip|চিপস","chips"},{"rice|চাল","rice"},{"egg|ডিম","eggs"},{"bread|পাউরুটি|bakery","bread"},{"biscuit|বিস্কুট|cookie","biscuit"},{"tea|চা","tea"},{"salt|লবণ","salt"},{"lentil|dal|ডাল","lentil"},{"noodle|নুডল","noodles"},{"soap|সাবান","soap"},{"drink|beverage|juice|cola|পানীয়","drink"},{"spice|মসলা","spice"}}; for(String[] row:x)for(String t:row[0].split("\\|"))if(h.contains(t))return "/images/products/"+row[1]+".svg"; return "/images/products/grocery.svg"; }
}
