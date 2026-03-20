-- Schema for Water Potability Data Warehouse

-- Dimension Table: Dim_Acidity
CREATE TABLE Dim_Acidity (
    Acidity_Key INT PRIMARY KEY,
    Category VARCHAR(50) NOT NULL -- Axit, Trung tính, Kiềm
);

-- Dimension Table: Dim_Hardness
CREATE TABLE Dim_Hardness (
    Hardness_Key INT PRIMARY KEY,
    Category VARCHAR(50) NOT NULL -- Nước mềm (Soft), Nước cứng vừa (Moderate), Nước cứng (Hard), Nước rất cứng (Very Hard)
);

-- Dimension Table: Dim_Potability
CREATE TABLE Dim_Potability (
    Potability_Key INT PRIMARY KEY,
    Label VARCHAR(20) NOT NULL -- Không an toàn (0), An toàn (1)
);

-- Fact Table: Fact_Water_Sample
CREATE TABLE Fact_Water_Sample (
    Water_ID SERIAL PRIMARY KEY,
    ph DECIMAL(10, 5),
    Hardness DECIMAL(10, 5),
    Solids DECIMAL(15, 5),
    Chloramines DECIMAL(10, 5),
    Sulfate DECIMAL(10, 5),
    Conductivity DECIMAL(10, 5),
    Organic_carbon DECIMAL(10, 5),
    Trihalomethanes DECIMAL(10, 5),
    Turbidity DECIMAL(10, 5),
    Acidity_Key INT,
    Hardness_Key INT,
    Potability_Key INT,
    CONSTRAINT fk_acidity FOREIGN KEY (Acidity_Key) REFERENCES Dim_Acidity(Acidity_Key),
    CONSTRAINT fk_hardness FOREIGN KEY (Hardness_Key) REFERENCES Dim_Hardness(Hardness_Key),
    CONSTRAINT fk_potability FOREIGN KEY (Potability_Key) REFERENCES Dim_Potability(Potability_Key)
);

-- Seed static data for Dimensions
INSERT INTO Dim_Acidity (Acidity_Key, Category) VALUES
(1, 'Axit'),
(2, 'Trung tính'),
(3, 'Kiềm');

INSERT INTO Dim_Hardness (Hardness_Key, Category) VALUES
(1, 'Nước mềm'),
(2, 'Nước cứng vừa'),
(3, 'Nước cứng'),
(4, 'Nước rất cứng');

INSERT INTO Dim_Potability (Potability_Key, Label) VALUES
(0, 'Không an toàn'),
(1, 'An toàn');
