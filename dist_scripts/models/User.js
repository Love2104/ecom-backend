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
exports.UserModel = void 0;
var db_1 = require("../config/db");
var bcryptjs_1 = __importDefault(require("bcryptjs"));
var UserModel = /** @class */ (function () {
    function UserModel() {
    }
    // Create a new user
    UserModel.create = function (userData) {
        return __awaiter(this, void 0, void 0, function () {
            var salt, hashedPassword, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, bcryptjs_1.default.genSalt(10)];
                    case 1:
                        salt = _a.sent();
                        return [4 /*yield*/, bcryptjs_1.default.hash(userData.password, salt)];
                    case 2:
                        hashedPassword = _a.sent();
                        return [4 /*yield*/, (0, db_1.query)("INSERT INTO users (\n        email, password_hash, name, role, is_verified, \n        otp_code, otp_expires_at, \n        supplier_status, business_name, gst_number, \n        manager_key_id\n      ) \n      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) \n      RETURNING *", [
                                userData.email,
                                hashedPassword,
                                userData.name,
                                userData.role || 'BUYER',
                                userData.is_verified || false,
                                userData.otp_code || null,
                                userData.otp_expires_at || null,
                                userData.supplier_status || 'NONE',
                                userData.business_name || null,
                                userData.gst_number || null,
                                userData.manager_key_id || null
                            ])];
                    case 3:
                        result = _a.sent();
                        return [2 /*return*/, result.rows[0]];
                }
            });
        });
    };
    UserModel.findByEmail = function (email) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, db_1.query)('SELECT * FROM users WHERE email = $1', [email])];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result.rows[0] || null];
                }
            });
        });
    };
    UserModel.findById = function (id) {
        return __awaiter(this, void 0, void 0, function () {
            var result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, db_1.query)('SELECT * FROM users WHERE id = $1', [id])];
                    case 1:
                        result = _a.sent();
                        return [2 /*return*/, result.rows[0] || null];
                }
            });
        });
    };
    UserModel.update = function (id, userData) {
        return __awaiter(this, void 0, void 0, function () {
            var fields, values, valueIndex, salt, hashedPassword, queryText, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        fields = [];
                        values = [];
                        valueIndex = 1;
                        // Standard fields
                        if (userData.name) {
                            fields.push("name = $".concat(valueIndex++));
                            values.push(userData.name);
                        }
                        if (userData.email) {
                            fields.push("email = $".concat(valueIndex++));
                            values.push(userData.email);
                        }
                        if (userData.role) {
                            fields.push("role = $".concat(valueIndex++));
                            values.push(userData.role);
                        }
                        if (!userData.password) return [3 /*break*/, 3];
                        return [4 /*yield*/, bcryptjs_1.default.genSalt(10)];
                    case 1:
                        salt = _a.sent();
                        return [4 /*yield*/, bcryptjs_1.default.hash(userData.password, salt)];
                    case 2:
                        hashedPassword = _a.sent();
                        fields.push("password_hash = $".concat(valueIndex++));
                        values.push(hashedPassword);
                        _a.label = 3;
                    case 3:
                        if (userData.is_verified !== undefined) {
                            fields.push("is_verified = $".concat(valueIndex++));
                            values.push(userData.is_verified);
                        }
                        if (userData.otp_code !== undefined) {
                            fields.push("otp_code = $".concat(valueIndex++));
                            values.push(userData.otp_code);
                        }
                        if (userData.otp_expires_at !== undefined) {
                            fields.push("otp_expires_at = $".concat(valueIndex++));
                            values.push(userData.otp_expires_at);
                        }
                        // Supplier fields
                        if (userData.supplier_status) {
                            fields.push("supplier_status = $".concat(valueIndex++));
                            values.push(userData.supplier_status);
                        }
                        if (userData.business_name) {
                            fields.push("business_name = $".concat(valueIndex++));
                            values.push(userData.business_name);
                        }
                        if (userData.gst_number) {
                            fields.push("gst_number = $".concat(valueIndex++));
                            values.push(userData.gst_number);
                        }
                        if (fields.length === 0)
                            return [2 /*return*/, null];
                        values.push(id);
                        queryText = "UPDATE users SET ".concat(fields.join(', '), " WHERE id = $").concat(valueIndex, " RETURNING *");
                        return [4 /*yield*/, (0, db_1.query)(queryText, values)];
                    case 4:
                        result = _a.sent();
                        return [2 /*return*/, result.rows[0] || null];
                }
            });
        });
    };
    return UserModel;
}());
exports.UserModel = UserModel;
