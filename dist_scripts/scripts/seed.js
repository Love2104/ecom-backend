"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
var db_1 = require("../config/db");
var User_1 = require("../models/User");
var bcryptjs_1 = __importDefault(require("bcryptjs"));
var ManagerKey_1 = require("../models/ManagerKey");
var uuid_1 = require("uuid");
var seed = function () { return __awaiter(void 0, void 0, void 0, function () {
    var superAdminEmail, superAdminPass, adminId, existingAdmin, salt, hashedPassword, res, i, keyCode, categories, categoryMap, _i, categories_1, cat, check, catId, res, supplierEmail, supplierId, existingSupplier, salt, hash, res, products, _a, products_1, p, catId, check, error_1;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                _b.trys.push([0, 29, , 30]);
                console.log('🌱 Seeding database...');
                superAdminEmail = 'love@gmail.com';
                superAdminPass = 'Love@2004';
                adminId = void 0;
                return [4 /*yield*/, User_1.UserModel.findByEmail(superAdminEmail)];
            case 1:
                existingAdmin = _b.sent();
                if (!existingAdmin) return [3 /*break*/, 2];
                console.log('ℹ️ Superadmin already exists.');
                adminId = existingAdmin.id;
                return [3 /*break*/, 6];
            case 2: return [4 /*yield*/, bcryptjs_1.default.genSalt(10)];
            case 3:
                salt = _b.sent();
                return [4 /*yield*/, bcryptjs_1.default.hash(superAdminPass, salt)];
            case 4:
                hashedPassword = _b.sent();
                return [4 /*yield*/, (0, db_1.query)("INSERT INTO users (name, email, password_hash, role, is_verified)\n         VALUES ($1, $2, $3, 'SUPERADMIN', true)\n         RETURNING id", ['Super Admin', superAdminEmail, hashedPassword])];
            case 5:
                res = _b.sent();
                adminId = res.rows[0].id;
                console.log('✅ Superadmin created (love@gmail.com).');
                _b.label = 6;
            case 6:
                i = 1;
                _b.label = 7;
            case 7:
                if (!(i <= 2)) return [3 /*break*/, 10];
                keyCode = "MGR-KEY-".concat((0, uuid_1.v4)().slice(0, 8).toUpperCase());
                // Verify if key already exists or just create new one
                return [4 /*yield*/, ManagerKey_1.ManagerKeyModel.create({
                        key_code: keyCode,
                        created_by: adminId,
                        assigned_email: "manager".concat(i, "@shopease.com")
                    })];
            case 8:
                // Verify if key already exists or just create new one
                _b.sent();
                console.log("\u2705 Manager Key ".concat(i, " created: ").concat(keyCode));
                _b.label = 9;
            case 9:
                i++;
                return [3 /*break*/, 7];
            case 10:
                categories = [
                    { name: 'Electronics', slug: 'electronics', image: 'https://images.unsplash.com/photo-1498049860654-af1a5c5668ba?auto=format&fit=crop&w=500' },
                    { name: 'Fashion', slug: 'fashion', image: 'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=500' },
                    { name: 'Home & Living', slug: 'home-living', image: 'https://images.unsplash.com/photo-1484101403633-562f891dc89a?auto=format&fit=crop&w=500' }
                ];
                categoryMap = {};
                _i = 0, categories_1 = categories;
                _b.label = 11;
            case 11:
                if (!(_i < categories_1.length)) return [3 /*break*/, 17];
                cat = categories_1[_i];
                return [4 /*yield*/, (0, db_1.query)('SELECT id FROM categories WHERE slug = $1', [cat.slug])];
            case 12:
                check = _b.sent();
                catId = void 0;
                if (!(check.rows.length === 0)) return [3 /*break*/, 14];
                return [4 /*yield*/, (0, db_1.query)('INSERT INTO categories (name, slug, image_url) VALUES ($1, $2, $3) RETURNING id', [cat.name, cat.slug, cat.image])];
            case 13:
                res = _b.sent();
                catId = res.rows[0].id;
                console.log("\u2705 Category '".concat(cat.name, "' created."));
                return [3 /*break*/, 15];
            case 14:
                catId = check.rows[0].id;
                _b.label = 15;
            case 15:
                categoryMap[cat.name] = catId;
                _b.label = 16;
            case 16:
                _i++;
                return [3 /*break*/, 11];
            case 17:
                supplierEmail = 'supplier@shopease.com';
                supplierId = void 0;
                return [4 /*yield*/, User_1.UserModel.findByEmail(supplierEmail)];
            case 18:
                existingSupplier = _b.sent();
                if (!!existingSupplier) return [3 /*break*/, 22];
                return [4 /*yield*/, bcryptjs_1.default.genSalt(10)];
            case 19:
                salt = _b.sent();
                return [4 /*yield*/, bcryptjs_1.default.hash('Supplier@123', salt)];
            case 20:
                hash = _b.sent();
                return [4 /*yield*/, (0, db_1.query)("INSERT INTO users (name, email, password_hash, role, is_verified, supplier_status, business_name, gst_number)\n             VALUES ($1, $2, $3, 'SUPPLIER', true, 'APPROVED', 'Prime Supplies', 'GSTIN12345')\n             RETURNING id", ['Demo Supplier', supplierEmail, hash])];
            case 21:
                res = _b.sent();
                supplierId = res.rows[0].id;
                console.log('✅ Supplier created.');
                return [3 /*break*/, 23];
            case 22:
                supplierId = existingSupplier.id;
                _b.label = 23;
            case 23:
                products = [
                    { name: 'Sony WH-1000XM5', cat: 'Electronics', price: 29999, img: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?auto=format&fit=crop&w=500' },
                    { name: 'MacBook Air M2', cat: 'Electronics', price: 99900, img: 'https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=500' },
                    { name: 'Samsung S24 Ultra', cat: 'Electronics', price: 129000, img: 'https://images.unsplash.com/photo-1610945265078-3858a0820dc3?auto=format&fit=crop&w=500' },
                    { name: 'Nike Air Jordan', cat: 'Fashion', price: 12500, img: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=500' },
                    { name: 'Levis Denim Jacket', cat: 'Fashion', price: 4500, img: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?auto=format&fit=crop&w=500' },
                    { name: 'Ray-Ban Aviator', cat: 'Fashion', price: 8900, img: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?auto=format&fit=crop&w=500' },
                    { name: 'Herman Miller Chair', cat: 'Home & Living', price: 45000, img: 'https://images.unsplash.com/photo-1505843490538-5133c6c7d0e1?auto=format&fit=crop&w=500' },
                    { name: 'Dyson Air Purifier', cat: 'Home & Living', price: 32000, img: 'https://images.unsplash.com/photo-1585771724684-38269d6639fd?auto=format&fit=crop&w=500' },
                    { name: 'Philips Hue Bulbs', cat: 'Home & Living', price: 3500, img: 'https://images.unsplash.com/photo-1558611848-73f7eb4001a1?auto=format&fit=crop&w=500' },
                    { name: 'iPad Pro 12.9', cat: 'Electronics', price: 85000, img: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=500' }
                ];
                _a = 0, products_1 = products;
                _b.label = 24;
            case 24:
                if (!(_a < products_1.length)) return [3 /*break*/, 28];
                p = products_1[_a];
                catId = categoryMap[p.cat];
                return [4 /*yield*/, (0, db_1.query)('SELECT id FROM products WHERE name = $1', [p.name])];
            case 25:
                check = _b.sent();
                if (!(check.rows.length === 0)) return [3 /*break*/, 27];
                return [4 /*yield*/, (0, db_1.query)("INSERT INTO products (supplier_id, category_id, name, description, price, stock, images, is_active)\n                 VALUES ($1, $2, $3, $4, $5, $6, $7, true)", [supplierId, catId, p.name, "Premium ".concat(p.name, " - Official Global Version"), p.price, 50, [p.img]])];
            case 26:
                _b.sent();
                console.log("\u2705 Product '".concat(p.name, "' created."));
                _b.label = 27;
            case 27:
                _a++;
                return [3 /*break*/, 24];
            case 28:
                console.log('✨ Seeding completed successfully.');
                process.exit(0);
                return [3 /*break*/, 30];
            case 29:
                error_1 = _b.sent();
                console.error('❌ Seeding failed:', error_1);
                process.exit(1);
                return [3 /*break*/, 30];
            case 30: return [2 /*return*/];
        }
    });
}); };
seed();
