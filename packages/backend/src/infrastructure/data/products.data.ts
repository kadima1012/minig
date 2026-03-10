import { Product, ProductPairEntity } from "../../domain/entities/Product";

const products = [
  new Product("p1", "iPhone 15 Pro", "https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=400", "Electronics", 999),
  new Product("p2", "Samsung Galaxy S24", "https://images.unsplash.com/photo-1706220027907-e3777b6e44b9?w=400", "Electronics", 799),
  new Product("p3", "MacBook Air M3", "https://images.unsplash.com/photo-1611186871525-9b7bb05ec0f3?w=400", "Electronics", 1299),
  new Product("p4", "Dell XPS 13", "https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=400", "Electronics", 1099),
  new Product("p5", "Sony WH-1000XM5", "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400", "Electronics", 349),
  new Product("p6", "AirPods Pro", "https://images.unsplash.com/photo-1603351154351-5e2d0600bb77?w=400", "Electronics", 249),
  new Product("p7", "Nike Air Jordan 1", "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400", "Fashion", 180),
  new Product("p8", "Adidas Yeezy Boost", "https://images.unsplash.com/photo-1600269452121-4f2416e55c28?w=400", "Fashion", 220),
  new Product("p9", "Rolex Submariner", "https://images.unsplash.com/photo-1547996160-81dfa63595aa?w=400", "Watches", 8950),
  new Product("p10", "Omega Seamaster", "https://images.unsplash.com/photo-1616067703986-91c58a82e941?w=400", "Watches", 5200),
  new Product("p11", "Tesla Model 3", "https://images.unsplash.com/photo-1560958089-b8a1929cea89?w=400", "Cars", 38990),
  new Product("p12", "BMW 3 Series", "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=400", "Cars", 43000),
];

export const productPairsData: ProductPairEntity[] = [
  new ProductPairEntity("pair1", products[0], products[1]),
  new ProductPairEntity("pair2", products[2], products[3]),
  new ProductPairEntity("pair3", products[4], products[5]),
  new ProductPairEntity("pair4", products[6], products[7]),
  new ProductPairEntity("pair5", products[8], products[9]),
  new ProductPairEntity("pair6", products[10], products[11]),
];
