package main

import (
	"log"
	"net/http"

	"github.com/glebarez/sqlite"
	"github.com/labstack/echo/v4"
	"gorm.io/gorm"
)

type Product struct {
	ID         uint      `gorm:"primaryKey" json:"id"`
	Name       string    `json:"name"`
	Price      float64   `json:"price"`
	CategoryID uint      `json:"category_id"`
	Category   *Category `json:"category,omitempty"`
}

type Category struct {
	ID       uint      `gorm:"primaryKey" json:"id"`
	Name     string    `json:"name"`
	Products []Product `json:"products,omitempty"`
}

type User struct {
	ID    uint   `gorm:"primaryKey" json:"id"`
	Email string `json:"email"`
}

type Order struct {
	ID     uint  `gorm:"primaryKey" json:"id"`
	UserID uint  `json:"user_id"`
	User   *User `json:"user,omitempty"`
}

type AuditLog struct {
	ID      uint   `gorm:"primaryKey" json:"id"`
	Message string `json:"message"`
}

var db *gorm.DB

func initDB() {
	var err error
	db, err = gorm.Open(sqlite.Open("app.db"), &gorm.Config{})
	if err != nil {
		log.Fatalln("cannot open database:", err)
	}
	if err := db.AutoMigrate(&Product{}, &Category{}, &User{}, &Order{}, &AuditLog{}); err != nil {
		log.Fatalln("migration failed:", err)
	}
}

func getProducts(c echo.Context) error {
	var products []Product
	if err := db.Preload("Category").Find(&products).Error; err != nil {
		return c.JSON(http.StatusInternalServerError, echo.Map{"error": err.Error()})
	}
	return c.JSON(http.StatusOK, products)
}

func getProduct(c echo.Context) error {
	var product Product
	if err := db.Preload("Category").First(&product, c.Param("id")).Error; err != nil {
		return c.JSON(http.StatusNotFound, echo.Map{"error": "not found"})
	}
	return c.JSON(http.StatusOK, product)
}

func createProduct(c echo.Context) error {
	var p Product
	if err := c.Bind(&p); err != nil {
		return c.JSON(http.StatusBadRequest, echo.Map{"error": err.Error()})
	}
	if err := db.Create(&p).Error; err != nil {
		return c.JSON(http.StatusInternalServerError, echo.Map{"error": err.Error()})
	}
	return c.JSON(http.StatusCreated, p)
}

func updateProduct(c echo.Context) error {
	var p Product
	if err := db.First(&p, c.Param("id")).Error; err != nil {
		return c.JSON(http.StatusNotFound, echo.Map{"error": "not found"})
	}
	if err := c.Bind(&p); err != nil {
		return c.JSON(http.StatusBadRequest, echo.Map{"error": err.Error()})
	}
	if err := db.Save(&p).Error; err != nil {
		return c.JSON(http.StatusInternalServerError, echo.Map{"error": err.Error()})
	}
	return c.JSON(http.StatusOK, p)
}

func deleteProduct(c echo.Context) error {
	if err := db.Delete(&Product{}, c.Param("id")).Error; err != nil {
		return c.JSON(http.StatusInternalServerError, echo.Map{"error": err.Error()})
	}
	return c.NoContent(http.StatusNoContent)
}

func main() {
	initDB()

	e := echo.New()

	e.GET("/products", getProducts)
	e.GET("/products/:id", getProduct)
	e.POST("/products", createProduct)
	e.PUT("/products/:id", updateProduct)
	e.DELETE("/products/:id", deleteProduct)

	log.Println("Listening on :8080")
	if err := e.Start(":8080"); err != nil {
		log.Fatal(err)
	}
}
