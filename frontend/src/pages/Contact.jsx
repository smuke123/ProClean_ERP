import React, { useState } from "react";
import { sendContactMessage } from '../utils/api.js';

export default function Contact() {
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    message: "",
    inquiryType: "general"
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess(false);

    try {
      await sendContactMessage({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        message: formData.message
      });
      
      setSuccess(true);
      setFormData({
        firstName: "",
        lastName: "",
        email: "",
        message: "",
        inquiryType: "general"
      });
      
      // Ocultar mensaje de éxito después de 5 segundos
      setTimeout(() => setSuccess(false), 5000);
    } catch (err) {
      setError(err.message || "Error al enviar el mensaje. Por favor, intenta nuevamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="px-8 py-8 lg:py-16">
      <div className="container mx-auto text-center">
        <h5 className="mb-4 text-base lg:text-2xl text-gray-700">
          Atención al Cliente
        </h5>
        <h1 className="mb-4 text-3xl lg:text-5xl font-bold text-gray-900">
          Estamos Aquí para Ayudarte
        </h1>
        <p className="mb-10 font-normal text-lg lg:mb-20 mx-auto max-w-3xl text-gray-500">
          Ya sea una pregunta sobre nuestros servicios, una solicitud de
          asistencia técnica o sugerencias para mejorar, nuestro equipo está
          ansioso por escucharte.
        </p>
        <div className="flex flex-col lg:flex-row gap-12 items-start">
          {/* Imagen o mapa */}
          <div className="w-full lg:flex-1 h-auto lg:h-[510px] bg-gray-50 rounded-lg flex items-center justify-center border border-gray-200">
            <div className="text-center p-8">
              <div className="text-6xl mb-4">📍</div>
              <p className="text-gray-700 text-lg font-medium">ProClean ERP</p>
              <p className="text-gray-500 mt-2">Calle 123 #45-67, Bogotá</p>
            </div>
          </div>
          
          {/* Contenedor invisible para el formulario */}
          <div className="w-full lg:w-auto lg:flex-shrink-0">
            <div className="max-w-sm mx-auto lg:mx-0">
              <form
                onSubmit={handleSubmit}
                className="flex flex-col gap-4"
              >
                <p className="text-left font-semibold text-sm text-gray-600">
                  Selecciona el Tipo de Consulta
                </p>
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, inquiryType: "general" }))}
                    className={`px-4 py-2 rounded-lg border transition-colors uppercase text-sm font-medium ${
                      formData.inquiryType === "general"
                        ? "border-gray-900 bg-gray-50 text-gray-900"
                        : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
                    }`}
                  >
                    Consulta General
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, inquiryType: "support" }))}
                    className={`px-4 py-2 rounded-lg border transition-colors uppercase text-sm font-medium ${
                      formData.inquiryType === "support"
                        ? "border-gray-900 bg-gray-50 text-gray-900"
                        : "border-gray-300 bg-white text-gray-700 hover:border-gray-400"
                    }`}
                  >
                    Soporte de Producto
                  </button>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col">
                    <label className="block text-sm font-medium text-gray-900 mb-2 text-left">
                      Nombre
                    </label>
                    <input
                      type="text"
                      name="firstName"
                      placeholder="Nombre"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-colors"
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="block text-sm font-medium text-gray-900 mb-2 text-left">
                      Apellido
                    </label>
                    <input
                      type="text"
                      name="lastName"
                      placeholder="Apellido"
                      value={formData.lastName}
                      onChange={handleChange}
                      className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-colors"
                    />
                  </div>
                </div>
                
                <div className="flex flex-col">
                  <label className="block text-sm font-medium text-gray-900 mb-2 text-left">
                    Tu Email
                  </label>
                  <input
                    type="email"
                    name="email"
                    placeholder="nombre@email.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-colors"
                  />
                </div>
                
                <div className="flex flex-col">
                  <label className="block text-sm font-medium text-gray-900 mb-2 text-left">
                    Tu Mensaje
                  </label>
                  <textarea
                    rows={6}
                    name="message"
                    placeholder="Mensaje"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-colors resize-none"
                  />
                </div>
                
                {error && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}
                
                {success && (
                  <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm">
                    ¡Mensaje enviado con éxito! Nos pondremos en contacto contigo pronto.
                  </div>
                )}
                
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full px-4 py-3 bg-gray-900 text-white rounded-lg font-medium uppercase text-sm hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-gray-900 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Enviando..." : "Enviar Mensaje"}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
