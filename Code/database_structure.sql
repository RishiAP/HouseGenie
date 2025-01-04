CREATE TABLE sqlite_sequence(name,seq);
CREATE TABLE service_categories(
	id INTEGER PRIMARY KEY,
	name VARCHAR(100) NOT NULL UNIQUE,
	description TEXT NOT NULL
);
CREATE TABLE services(
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	name VARCHAR(100) NOT NULL UNIQUE,
	price INTEGER NOT NULL,
	description TEXT NOT NULL,
	category_id INTEGER NOT NULL,
	time_required_minutes INTEGER NOT NULL, is_inactive BOOLEAN NOT NULL DEFAULT false,
	FOREIGN KEY (category_id) REFERENCES service_categories(id) ON DELETE CASCADE
);
CREATE TABLE admin(
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	email VARCHAR(100) NOT NULL UNIQUE,
	password BLOB NOT NULL
);
CREATE TABLE service_reviews (
    id INTEGER PRIMARY KEY,
    customer_rating INTEGER CHECK(customer_rating BETWEEN 1 AND 5),
    customer_review TEXT DEFAULT NULL,
    professional_rating INTEGER CHECK(professional_rating BETWEEN 1 AND 5),
    professional_review TEXT DEFAULT NULL,
    FOREIGN KEY (id) REFERENCES service_requests(id),
    CHECK (customer_rating IS NOT NULL OR professional_rating IS NOT NULL)
);
CREATE TABLE professionals(
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	email VARCHAR(100) NOT NULL UNIQUE,
	password BLOB NOT NULL,
	name VARCHAR(100) NOT NULL,
	phone VARCHAR(20) NOT NULL UNIQUE,
	service_id INTEGER NOT NULL,
	experience INTEGER NOT NULL,
	address VARCHAR(255) NOT NULL,
	pincode INTEGER NOT NULL,
	created_on DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
	approved BOOLEAN NOT NULL DEFAULT false, is_banned BOOLEAN NOT NULL DEFAULT false,
	FOREIGN KEY (service_id) REFERENCES services(id)
);
CREATE INDEX professional_pincode ON professionals(pincode);
CREATE TABLE customers(
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	email VARCHAR(100) NOT NULL UNIQUE,
	password BLOB NOT NULL,
	name VARCHAR(100) NOT NULL,
	phone VARCHAR(20) NOT NULL UNIQUE,
	address TEXT NOT NULL,
	pincode INTEGER NOT NULL,
	created_on DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
, is_banned BOOLEAN NOT NULL DEFAULT false);
CREATE INDEX customer_pincode ON customers(pincode);
CREATE TABLE service_requests (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    service_id INTEGER NOT NULL,
    customer_id INTEGER NOT NULL,
    professional_id INTEGER DEFAULT NULL,
    date_of_request DATETIME DEFAULT CURRENT_TIMESTAMP,
	date_of_service DATE NOT NULL,
    customer_remark TEXT DEFAULT NULL,
    professional_remark TEXT DEFAULT NULL,
    date_of_completion DATETIME DEFAULT NULL,
    service_status VARCHAR(10) NOT NULL DEFAULT 'Requested' CHECK(service_status IN ('Requested', 'Assigned', 'Accepted', 'Rejected', 'Closed')),
    FOREIGN KEY (service_id) REFERENCES services(id),
    FOREIGN KEY (customer_id) REFERENCES customers(id),
    FOREIGN KEY (professional_id) REFERENCES professionals(id)
);
CREATE INDEX idx_service_id ON service_requests(service_id);
CREATE INDEX idx_professional_id ON service_requests(professional_id);
CREATE INDEX idx_customer_id ON service_requests(customer_id);
CREATE TRIGGER validate_professional_service_id
BEFORE INSERT ON service_requests
FOR EACH ROW
WHEN NEW.professional_id IS NOT NULL
BEGIN
    SELECT CASE 
        WHEN (SELECT service_id FROM professionals WHERE id = NEW.professional_id) != NEW.service_id
        THEN RAISE(ABORT, "Professional's service ID does not match the service request's service ID")
    END;
END;
CREATE TRIGGER validate_professional_service_id_update
BEFORE UPDATE ON service_requests
FOR EACH ROW
WHEN NEW.professional_id IS NOT NULL
BEGIN
    SELECT CASE 
        WHEN (SELECT service_id FROM professionals WHERE id = NEW.professional_id) != NEW.service_id
        THEN RAISE(ABORT, "Professional's service ID does not match the service request's service ID")
    END;
END;
