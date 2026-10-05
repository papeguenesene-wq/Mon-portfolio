// Ce fichier gère le menu mobile et la validation du formulaire de contact.
// Il est exécuté lorsque la page est chargée.
document.addEventListener("DOMContentLoaded", () => {
  // 1) GESTION DU MENU MOBILE
  const button = document.querySelector(".menu-toggle");
  const nav = document.querySelector(".main-nav");

  if (button && nav) {
    button.addEventListener("click", () => {
      const isOpen = nav.classList.toggle("open");
      button.setAttribute("aria-expanded", String(isOpen));
    });
  }

  // Défilement automatique des photos d’activité.
  document.querySelectorAll(".activity-carousel[data-autoplay]").forEach(carousel => {
    const track = carousel.querySelector(".activity-carousel-track");
    const slides = carousel.querySelectorAll(".activity-slide");

    if (!track || slides.length < 2) return;

    let currentSlide = 0;
    let autoplayTimer = null;
    let pointerInside = false;
    let focusInside = false;
    let trackPosition = 1;

    const firstClone = slides[0].cloneNode(true);
    const lastClone = slides[slides.length - 1].cloneNode(true);
    firstClone.setAttribute("aria-hidden", "true");
    lastClone.setAttribute("aria-hidden", "true");
    firstClone.querySelector("img").alt = "";
    lastClone.querySelector("img").alt = "";
    track.append(firstClone);
    track.prepend(lastClone);

    const stopAutoplay = () => {
      if (autoplayTimer !== null) {
        window.clearInterval(autoplayTimer);
        autoplayTimer = null;
      }
    };

    const resetClonePosition = () => {
      trackPosition = trackPosition === 0 ? slides.length : 1;
      track.style.transition = "none";
      track.style.transform = `translateX(-${trackPosition * 100}%)`;
      track.offsetHeight;
      track.style.removeProperty("transition");
    };

    const moveSlide = (step) => {
      currentSlide = (currentSlide + step + slides.length) % slides.length;
      trackPosition += step;
      track.style.transform = `translateX(-${trackPosition * 100}%)`;

      slides.forEach((slide, slideIndex) => {
        slide.setAttribute("aria-hidden", String(slideIndex !== currentSlide));
      });

      if (window.matchMedia("(prefers-reduced-motion: reduce)").matches && (trackPosition === 0 || trackPosition === slides.length + 1)) {
        resetClonePosition();
      }
    };

    track.addEventListener("transitionend", event => {
      if (
        event.target === track &&
        (trackPosition === 0 || trackPosition === slides.length + 1)
      ) {
        resetClonePosition();
      }
    });

    const startAutoplay = () => {
      if (
        pointerInside ||
        focusInside ||
        window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ) {
        return;
      }

      stopAutoplay();
      autoplayTimer = window.setInterval(() => {
        moveSlide(1);
      }, 5000);
    };

    carousel.addEventListener("pointerenter", () => {
      pointerInside = true;
      stopAutoplay();
    });

    carousel.addEventListener("pointerleave", () => {
      pointerInside = false;
      startAutoplay();
    });

    carousel.addEventListener("focusin", () => {
      focusInside = true;
      stopAutoplay();
    });

    carousel.addEventListener("focusout", event => {
      if (!carousel.contains(event.relatedTarget)) {
        focusInside = false;
        startAutoplay();
      }
    });

    track.style.transform = `translateX(-${trackPosition * 100}%)`;
    slides.forEach((slide, slideIndex) => {
      slide.setAttribute("aria-hidden", String(slideIndex !== currentSlide));
    });
    startAutoplay();
  });

  // Masque les photos absentes pour conserver le visuel de remplacement.
  document.querySelectorAll(".activity-image img").forEach(image => {
    const imageContainer = image.parentElement;
    const showLoadedImage = () => {
      imageContainer.classList.add("has-photo");
    };
    const hideUnavailableImage = () => {
      image.hidden = true;
    };

    image.addEventListener("load", showLoadedImage, { once: true });
    image.addEventListener("error", hideUnavailableImage, { once: true });
    if (image.complete) {
      if (image.naturalWidth === 0) {
        hideUnavailableImage();
      } else {
        showLoadedImage();
      }
    }
  });

  // 2) FILTRAGE DES ACTIVITÉS
  const filters = document.querySelectorAll("[data-filter]");
  const activityCards = document.querySelectorAll(".activity-card[data-category]");
  const activityResult = document.querySelector(".activity-result");

  if (filters.length && activityCards.length) {
    filters.forEach(filter => {
      filter.addEventListener("click", () => {
        const selectedCategory = filter.dataset.filter;
        let visibleCount = 0;

        filters.forEach(item => {
          const isSelected = item === filter;
          item.classList.toggle("active", isSelected);
          item.setAttribute("aria-pressed", String(isSelected));
        });

        activityCards.forEach(card => {
          const isVisible = selectedCategory === "all" || card.dataset.category === selectedCategory;
          card.hidden = !isVisible;
          if (isVisible) visibleCount += 1;
        });

        if (activityResult) {
          activityResult.textContent = `Affichage de ${visibleCount} intervention${visibleCount > 1 ? "s" : ""}`;
        }
      });
    });
  }

  // 3) VALIDATION DE LA DEMANDE DE MAINTENANCE ET PRÉPARATION WHATSAPP
  const form = document.querySelector("#contact-form");
  if (!form) return;

  // Règles pour chaque champ du formulaire
  const fields = {
    name: {
      test: value => value.trim().length >= 2,
      message: "Veuillez saisir votre nom."
    },
    service: {
      test: value => value.trim().length > 0,
      message: "Veuillez sélectionner un domaine d’intervention."
    },
    message: {
      test: value => value.trim().length >= 10,
      message: "Veuillez décrire votre besoin (au moins 10 caractères)."
    }
  };

  // Vérifie un champ et affiche un message d'erreur s'il est invalide
  const validateField = (fieldId) => {
    const input = document.getElementById(fieldId);
    const error = document.getElementById(fieldId + "-error");
    const rule = fields[fieldId];

    if (!input || !error || !rule) return true;

    const isValid = rule.test(input.value);
    error.textContent = isValid ? "" : rule.message;
    input.removeAttribute("aria-invalid");

    if (!isValid) {
      input.setAttribute("aria-invalid", "true");
    }

    return isValid;
  };

  // Quand on soumet le formulaire
  form.addEventListener("submit", event => {
    event.preventDefault();

    let formIsValid = true;

    // Vérifie chaque champ un par un
    Object.keys(fields).forEach(fieldId => {
      const isValid = validateField(fieldId);
      if (!isValid) {
        formIsValid = false;
      }
    });

    const feedback = document.getElementById("form-feedback");
    if (!feedback) return;

    feedback.className = "form-feedback " + (formIsValid ? "success" : "fail");
    if (!formIsValid) {
      feedback.textContent = "Veuillez corriger les champs indiqués.";
      return;
    }

    const name = document.getElementById("name").value.trim();
    const service = document.getElementById("service").value;
    const message = document.getElementById("message").value.trim();
    const whatsappMessage = `Bonjour, je m'appelle ${name}. Je vous contacte pour le service suivant : ${service}. Voici mon besoin : ${message}`;
    const whatsappUrl = `https://wa.me/221774364759?text=${encodeURIComponent(whatsappMessage)}`;

    feedback.textContent = "Ouverture de WhatsApp… Vous pourrez vérifier et envoyer votre demande depuis l’application.";
    window.location.assign(whatsappUrl);
  });
});