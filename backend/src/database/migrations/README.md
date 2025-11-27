# Database Migrations

Bu klasör TypeORM migration dosyalarını içerir.

## Migration Oluşturma

TypeORM CLI kullanarak migration oluşturabilirsiniz:

```bash
npm run typeorm migration:create -- -n MigrationName
```

## Migration Çalıştırma

```bash
npm run typeorm migration:run
```

## Migration Geri Alma

```bash
npm run typeorm migration:revert
```

## Not

Development ortamında `synchronize: true` kullanıldığı için migration'lar otomatik çalışır.
Production ortamında `synchronize: false` olmalı ve migration'lar manuel çalıştırılmalıdır.

