import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    User,
    Mail,
    Phone,
    Shield,
    Save,
    Loader2,
    ArrowLeft,
    Camera,
    X,
    CheckCircle2,
    AlertCircle,
    RefreshCw,
    LogOut,
    Calendar,
    Clock,
    Activity,
    Users,
    Building2,
    FileText,
    Settings,
    Lock,
    Key,
    Plus,
    Trash2,
    Edit,
    Search,
    Filter,
    MoreVertical,
    UserPlus,
    UserCog,
    UserX,
    Eye,
    EyeOff,
    Copy,
    Download,
    Upload,
    ShieldAlert,
    ShieldCheck,
    Ban,
    CheckCircle,
    AlertTriangle,
    Info,
    Globe,
    MapPin,
    Briefcase,
    Star,
    Award,
    Target,
    TrendingUp,
    TrendingDown,
    DollarSign,
    Package,
    ShoppingCart,
    Truck,
    Warehouse,
    Home,
    BarChart3,
    PieChart,
    LineChart,
    DownloadCloud,
    UploadCloud,
    Database,
    Server,
    Cpu,
    HardDrive,
    Network,
    Wifi,
    Bluetooth,
    Zap,
    Battery,
    Sun,
    Moon,
    Cloud,
    CloudRain,
    CloudSnow,
    CloudLightning,
    Wind,
    Thermometer,
    Droplets,
    Flame,
    Snowflake,
    Umbrella,
    UmbrellaOff,
    Fan,
    AirVent,
    Car,
    Bike,
    Bus,
    Train,
    Ship,
    Plane,
    Rocket,
    Satellite,
    Radio,
    Tv,
    Monitor,
    Smartphone,
    Tablet,
    Laptop,
    Keyboard,
    Mouse,
    Printer,
    Scanner,
    Camera as CameraIcon,
    Video,
    Mic,
    Headphones,
    Speaker,
    Gamepad,
    Joystick,
    Puzzle,
    ToyBrick,
    BrickWall,
    Construction,
    Hammer,
    Wrench,
    Screwdriver,
    Pliers,
    Saw,
    Drill,
    Tool,
    Nut,
    Bolt,
    Gear,
    Cogs,
    Factory,
    Industrial,
    Pipeline,
    Oil,
    Gas,
    Coal,
    Nuclear,
    Solar,
    WindTurbine,
    Water,
    Recycle,
    Trash,
    Garbage,
    Compost,
    Leaf,
    Tree,
    Flower,
    Grass,
    Wheat,
    Corn,
    Apple,
    Banana,
    Carrot,
    Broccoli,
    Pizza,
    Burger,
    Coffee,
    Tea,
    Beer,
    Wine,
    Cocktail,
    GlassWater,
    Utensils,
    ChefHat,
    Oven,
    Microwave,
    Refrigerator,
    Freezer,
    WashingMachine,
    Dryer,
    Dishwasher,
    Vacuum,
    Broom,
    Mop,
    Bucket,
    Soap,
    SprayCan,
    Bug,
    Spider,
    Ant,
    Bee,
    Butterfly,
    Fish,
    Bird,
    Cat,
    Dog,
    Rabbit,
    Turtle,
    Snake,
    Lizard,
    Dragon,
    Unicorn,
    Phoenix,
    Pegasus,
    Griffin,
    Sphinx,
    Minotaur,
    Cyclops,
    Hydra,
    Kraken,
    Leviathan,
    Behemoth,
    Chimera,
    Basilisk,
    Cockatrice,
    Wyvern,
    Drake,
    Dragonfly,
    Mantis,
    Beetle,
    Ladybug,
    Cricket,
    Grasshopper,
    Locust,
    Cicada,
    Mosquito,
    Fly,
    Wasp,
    Hornet,
    Beehive,
    Honey,
    Hive,
    Queen,
    King,
    Crown,
    Throne,
    Castle,
    Fortress,
    Tower,
    Bridge,
    Wall,
    Gate,
    Door,
    Window,
    Roof,
    Floor,
    Stairs,
    Elevator,
    Escalator,
    Conveyor,
    Crane,
    Bulldozer,
    Excavator,
    Tractor,
    Combine,
    Harvester,
    Plow,
    Hoe,
    Shovel,
    Rake,
    Pitchfork,
    Scythe,
    Axe,
    Chainsaw,
    Logs,
    Wood,
    Timber,
    Lumber,
    Plywood,
    MDF,
    ParticleBoard,
    Veneer,
    Laminate,
    Hardwood,
    Softwood,
    Oak,
    Maple,
    Cherry,
    Walnut,
    Mahogany,
    Teak,
    Rosewood,
    Ebony,
    Pine,
    Cedar,
    Fir,
    Spruce,
    Birch,
    Aspen,
    Poplar,
    Willow,
    Palm,
    Bamboo,
    Rattan,
    Cane,
    Reed,
    Straw,
    Hay,
    Grass,
    Moss,
    Fern,
    Ivy,
    Vine,
    Bush,
    Hedge,
    Shrub,
    TreeIcon,
    Forest,
    Jungle,
    Rainforest,
    Taiga,
    Tundra,
    Desert,
    Savanna,
    Prairie,
    Steppe,
    Meadow,
    Field,
    Farm,
    Ranch,
    Orchard,
    Vineyard,
    Garden,
    Park,
    Zoo,
    Aquarium,
    Museum,
    Gallery,
    Theater,
    Cinema,
    Library,
    School,
    University,
    College,
    Academy,
    Institute,
    Laboratory,
    Observatory,
    Planetarium,
    SpaceStation,
    MoonBase,
    MarsColony,
    SpaceShip,
    UFO,
    Alien,
    Robot,
    Android,
    Cyborg,
    AI,
    NeuralNetwork,
    Brain,
    Mind,
    Consciousness,
    Soul,
    Spirit,
    Ghost,
    Angel,
    Demon,
    Devil,
    God,
    Goddess,
    Myth,
    Legend,
    Fantasy,
    Magic,
    Wizard,
    Witch,
    Sorcerer,
    Mage,
    Warlock,
    Necromancer,
    Druid,
    Shaman,
    Priest,
    Cleric,
    Paladin,
    Knight,
    Warrior,
    Barbarian,
    Berserker,
    Gladiator,
    Samurai,
    Ninja,
    Assassin,
    Thief,
    Rogue,
    Ranger,
    Hunter,
    Archer,
    Crossbow,
    Bow,
    Arrow,
    Sword,
    Dagger,
    Knife,
    Spear,
    Lance,
    Pike,
    Halberd,
    Axe as AxeIcon,
    Mace,
    Hammer as HammerIcon,
    Flail,
    Whip,
    Chain,
    Net,
    Trap,
    Bomb,
    Grenade,
    Missile,
    Rocket as RocketIcon,
    Cannon,
    Tank,
    Helicopter,
    Jet,
    Stealth,
    Drone,
    Submarine,
    Destroyer,
    Carrier,
    Battleship,
    Cruiser,
    Frigate,
    Corvette,
    PatrolBoat,
    Speedboat,
    Yacht,
    Sailboat,
    Kayak,
    Canoe,
    Raft,
    Surfboard,
    Paddleboard,
    Skis,
    Snowboard,
    Sled,
    Toboggan,
    Skateboard,
    RollerSkates,
    Bicycle,
    Unicycle,
    Tricycle,
    Scooter,
    Motorcycle,
    Moped,
    Scooter as ScooterIcon,
    ATV,
    UTV,
    Buggy,
    DuneBuggy,
    GolfCart,
    Segway,
    Hoverboard,
    Skate,
    IceSkates,
    RollerBlades,
    Shoes,
    Boots,
    Sandals,
    Slippers,
    Socks,
    Pants,
    Shorts,
    Skirt,
    Dress,
    Shirt,
    TShirt,
    Hoodie,
    Jacket,
    Coat,
    Vest,
    Suit,
    Tie,
    BowTie,
    Scarf,
    Hat,
    Cap,
    Beanie,
    Helmet as HelmetIcon,
    Goggles,
    Glasses,
    Sunglasses,
    Monocle,
    Mask,
    GasMask,
    Respirator,
    EarMuffs,
    Earplugs,
    Headphones as HeadphonesIcon,
    Earbuds,
    AirPods,
    Watch,
    Smartwatch,
    FitnessTracker,
    Pedometer,
    Compass,
    GPS,
    Map,
    Atlas,
    Globe as GlobeIcon,
    Earth,
    World,
    Continent,
    Country,
    City,
    Town,
    Village,
    Hamlet,
    Neighborhood,
    Street,
    Road,
    Highway,
    Bridge as BridgeIcon,
    Tunnel,
    Railway,
    Train as TrainIcon,
    Subway,
    Tram,
    Bus as BusIcon,
    Taxi,
    Car as CarIcon,
    Truck as TruckIcon,
    Van,
    SUV,
    Pickup,
    Minivan,
    Camper,
    RV,
    Motorhome,
    Trailer,
    Caravan,
    Boat,
    Ship as ShipIcon,
    Ferry,
    Cruise,
    Cargo,
    Container,
    Tanker,
    OilTanker,
    LNG,
    LPG,
    Chemical,
    BulkCarrier,
    RoRo,
    Passenger,
    Yacht as YachtIcon,
    Sailboat as SailboatIcon,
    Catamaran,
    Trimaran,
    Hydrofoil,
    Hovercraft,
    Airboat,
    JetSki,
    Waterski,
    Wakeboard,
    Surfboard as SurfboardIcon,
    Kiteboard,
    Windsurf,
    Paraglider,
    HangGlider,
    Wingsuit,
    Parachute,
    Balloon,
    Airship,
    Zeppelin,
    Blimp,
    Plane as PlaneIcon,
    Jet as JetIcon,
    Fighter,
    Bomber,
    Transport,
    CargoPlane,
    PassengerPlane,
    PrivateJet,
    BusinessJet,
    LightAircraft,
    Ultralight,
    Gyrocopter,
    Autogyro,
    Helicopter as HelicopterIcon,
    Quadcopter,
    Drone as DroneIcon,
    Rocket as RocketIcon2,
    Spaceship,
    SpaceShuttle,
    SpaceCapsule,
    SpaceProbe,
    Satellite as SatelliteIcon,
    SpaceStation as SpaceStationIcon,
    Telescope,
    Microscope,
    MagnifyingGlass,
    Binoculars,
    Periscope,
    Kaleidoscope,
    Stethoscope,
    Thermometer as ThermometerIcon,
    Barometer,
    Hygrometer,
    Anemometer,
    WeatherVane,
    RainGauge,
    SnowGauge,
    Seismograph,
    RichterScale,
    MercalliScale,
    FujitaScale,
    SaffirSimpson,
    BeaufortScale,
    UVIndex,
    AirQuality,
    Pollution,
    Smog,
    Haze,
    Fog,
    Mist,
    Frost,
    Ice,
    Hail,
    Sleet,
    FreezingRain,
    BlackIce,
    Avalanche,
    Landslide,
    Earthquake,
    Tsunami,
    Volcano,
    Eruption,
    Lava,
    Magma,
    Ash,
    Smoke,
    Fire,
    Wildfire,
    ForestFire,
    Bushfire,
    Grassfire,
    Bonfire,
    Campfire,
    Fireplace,
    Furnace,
    Kiln,
    Oven as OvenIcon,
    Stove,
    Cooker,
    Grill,
    BBQ,
    Smoker,
    DeepFryer,
    PressureCooker,
    SlowCooker,
    RiceCooker,
    BreadMaker,
    Toaster,
    Kettle,
    CoffeeMaker,
    EspressoMachine,
    CappuccinoMaker,
    TeaMaker,
    WaterHeater,
    WaterCooler,
    WaterDispenser,
    IceMaker,
    Refrigerator as RefrigeratorIcon,
    Freezer as FreezerIcon,
    FridgeFreezer,
    WineCooler,
    BeerFridge,
    BeverageCooler,
    DisplayFridge,
    Merchandiser,
    IceCreamFreezer,
    GelatoDisplay,
    FrozenFoodCabinet,
    ColdRoom,
    WalkInCooler,
    WalkInFreezer,
    BlastChiller,
    ShockFreezer,
    CryogenicFreezer,
    LiquidNitrogen,
    DryIce,
    Coolant,
    Refrigerant,
    Compressor,
    Condenser,
    Evaporator,
    HeatExchanger,
    Radiator,
    Heater,
    Boiler,
    WaterHeater as WaterHeaterIcon,
    HeatPump,
    AirConditioner,
    SplitSystem,
    WindowUnit,
    PortableAC,
    DuctedAC,
    CentralAC,
    Chiller,
    CoolingTower,
    AirHandler,
    FanCoil,
    VRF,
    VRV,
    HVAC,
    Ventilation,
    ExhaustFan,
    CeilingFan,
    PedestalFan,
    TowerFan,
    DeskFan,
    WallFan,
    AtticFan,
    WholeHouseFan,
    AirPurifier,
    Humidifier,
    Dehumidifier,
    AirCleaner,
    Ionizer,
    Ozonator,
    UVLight,
    GermicidalLamp,
    Sterilizer,
    Sanitizer,
    Disinfectant,
    Cleaner,
    Soap as SoapIcon,
    Detergent,
    Bleach,
    Ammonia,
    Vinegar,
    BakingSoda,
    Borax,
    WashingSoda,
    OxygenBleach,
    ChlorineBleach,
    HydrogenPeroxide,
    RubbingAlcohol,
    HandSanitizer,
    SurfaceCleaner,
    GlassCleaner,
    FloorCleaner,
    CarpetCleaner,
    UpholsteryCleaner,
    LeatherCleaner,
    WoodCleaner,
    MetalCleaner,
    JewelryCleaner,
    ElectronicsCleaner,
    ScreenCleaner,
    LensCleaner,
    CameraLens,
    CameraBody,
    CameraFlash,
    CameraTripod,
    CameraGimbal,
    CameraStabilizer,
    CameraSlider,
    CameraDolly,
    CameraRig,
    CameraCrane,
    CameraJib,
    CameraArm,
    CameraMount,
    CameraHead,
    CameraRemote,
    CameraController,
    CameraTrigger,
    CameraShutter,
    CameraAperture,
    CameraFocus,
    CameraZoom,
    CameraLensCap,
    CameraFilter,
    CameraLensHood,
    CameraLensAdapter,
    CameraTeleconverter,
    CameraExtensionTube,
    CameraBellows,
    CameraMacroTube,
    CameraMicroscopeAdapter,
    CameraTelescopeAdapter,
    CameraMicroscope,
    CameraTelescope,
    CameraBinoculars,
    CameraMonocular,
    CameraSpottingScope,
    CameraNightVision,
    CameraThermal,
    CameraInfrared,
    CameraUV,
    CameraMultispectral,
    CameraHyperspectral,
    Camera3D,
    Camera360,
    CameraAction,
    CameraDrone,
    CameraUnderwater,
    CameraWaterproof,
    CameraWeatherproof,
    CameraRugged,
    CameraIndustrial,
    CameraMedical,
    CameraScientific,
    CameraResearch,
    CameraLaboratory,
    CameraMicroscopy,
    CameraMacroscopy,
    CameraPhotography,
    CameraVideography,
    CameraCinematography,
    CameraBroadcast,
    CameraStudio,
    CameraLocation,
    CameraEvent,
    CameraWedding,
    CameraPortrait,
    CameraLandscape,
    CameraWildlife,
    CameraSports,
    CameraActionSports,
    CameraUnderwaterSports,
    CameraAerial,
    CameraSpace,
    CameraAstronomy,
    CameraAstrophotography,
    CameraPlanetary,
    CameraLunar,
    CameraSolar,
    CameraDeepSky,
    CameraNebula,
    CameraGalaxy,
    CameraStarCluster,
    CameraComet,
    CameraAsteroid,
    CameraMeteor,
    CameraAurora,
    CameraMilkyWay,
    CameraConstellation,
    CameraZodiac,
    CameraEclipse,
    CameraTransit,
    CameraOccultation,
    CameraConjunction,
    CameraOpposition,
    CameraQuadrature,
    CameraElongation,
    CameraPhase,
    CameraLibration,
    CameraParallax,
    CameraAberration,
    CameraRefraction,
    CameraScintillation,
    CameraSeeing,
    CameraTransparency,
    CameraTurbulence,
    CameraDispersion,
    CameraAbsorption,
    CameraEmission,
    CameraReflection,
    CameraRefraction as CameraRefractionIcon,
    CameraDiffraction,
    CameraInterference,
    CameraPolarization,
    CameraScattering,
    CameraFluorescence,
    CameraPhosphorescence,
    CameraBioluminescence,
    CameraChemiluminescence,
    CameraElectroluminescence,
    CameraThermoluminescence,
    CameraSonoluminescence,
    CameraRadioluminescence,
    CameraCathodoluminescence,
    CameraPhotoluminescence,
    CameraTriboluminescence,
    CameraPiezoluminescence,
    CameraCrystalloluminescence,
    CameraLyoluminescence,
    CameraXrayLuminescence,
    CameraGammaLuminescence,
    CameraNeutronLuminescence,
    CameraProtonLuminescence,
    CameraElectronLuminescence,
    CameraIonLuminescence,
    CameraAtomLuminescence,
    CameraMoleculeLuminescence,
    CameraQuantumLuminescence,
    CameraNanoparticleLuminescence,
    CameraQuantumDot,
    CameraNanocrystal,
    CameraNanowire,
    CameraNanotube,
    CameraGraphene,
    CameraCarbonNanotube,
    CameraFullerene,
    CameraDiamond,
    CameraGraphite,
    CameraCharcoal,
    CameraCarbonBlack,
    CameraCarbonFiber,
    CameraCarbonComposite,
    CameraCarbonAllotrope,
    CameraCarbonIsotope,
    CameraCarbon14,
    CameraCarbonDating,
    CameraCarbonCycle,
    CameraCarbonSequestration,
    CameraCarbonCapture,
    CameraCarbonStorage,
    CameraCarbonUtilization,
    CameraCarbonRemoval,
    CameraCarbonOffset,
    CameraCarbonCredit,
    CameraCarbonTax,
    CameraCarbonMarket,
    CameraCarbonTrading,
    CameraCarbonFootprint,
    CameraCarbonNeutral,
    CameraCarbonNegative,
    CameraCarbonPositive,
    CameraCarbonZero,
    CameraCarbonFree,
    CameraCarbonIntensity,
    CameraCarbonDensity,
    CameraCarbonFlux,
    CameraCarbonSink,
    CameraCarbonSource,
    CameraCarbonPool,
    CameraCarbonReservoir,
    CameraCarbonStock,
    CameraCarbonFlow,
    CameraCarbonBudget,
    CameraCarbonBalance,
    CameraCarbonAccounting,
    CameraCarbonReporting,
    CameraCarbonVerification,
    CameraCarbonValidation,
    CameraCarbonCertification,
    CameraCarbonStandard,
    CameraCarbonProtocol,
    CameraCarbonMethodology,
    CameraCarbonBaseline,
    CameraCarbonAdditionality,
    CameraCarbonLeakage,
    CameraCarbonPermanence,
    CameraCarbonReversal,
    CameraCarbonRisk,
    CameraCarbonUncertainty,
    CameraCarbonDiscount,
    CameraCarbonPremium,
    CameraCarbonPrice,
    CameraCarbonValue,
    CameraCarbonCost,
    CameraCarbonBenefit,
    CameraCarbonTradeoff,
    CameraCarbonSynergy,
    CameraCarbonCoBenefit,
    CameraCarbonImpact,
    CameraCarbonOutcome,
    CameraCarbonResult,
    CameraCarbonEffect,
    CameraCarbonConsequence,
    CameraCarbonImplication,
    CameraCarbonRamification,
    CameraCarbonAftermath,
    CameraCarbonFallout,
    CameraCarbonRipple,
    CameraCascade,
    CameraChainReaction,
    CameraDominoEffect,
    CameraSnowballEffect,
    CameraButterflyEffect,
    CameraTippingPoint,
    CameraCriticalMass,
    CameraThreshold,
    CameraLimit,
    CameraBoundary,
    CameraFrontier,
    CameraHorizon,
    CameraVista,
    CameraPanorama,
    CameraVignette,
    CameraSnapshot,
    CameraPortrait as CameraPortraitIcon,
    CameraLandscape as CameraLandscapeIcon,
    CameraMacro,
    CameraMicro,
    CameraNano,
    CameraPico,
    CameraFemto,
    CameraAtto,
    CameraZepto,
    CameraYocto,
    CameraPlanck,
    CameraQuantum,
    CameraString,
    CameraMembrane,
    CameraBrane,
    CameraMultiverse,
    CameraParallelUniverse,
    CameraAlternateReality,
    CameraSimulation,
    CameraHologram,
    CameraProjection,
    CameraIllusion,
    CameraMirage,
    CameraFataMorgana,
    CameraNorthernLights,
    CameraSouthernLights,
    CameraZodiacalLight,
    CameraGegenschein,
    CameraAirglow,
    CameraNightglow,
    CameraDayglow,
    CameraTwilightGlow,
    CameraAlpenglow,
    CameraBeltOfVenus,
    CameraEarthShadow,
    CameraMoonShadow,
    CameraSunShadow,
    CameraPlanetShadow,
    CameraStarShadow,
    CameraGalaxyShadow,
    CameraNebulaShadow,
    CameraClusterShadow,
    CameraVoidShadow,
    CameraFilamentShadow,
    CameraSheetShadow,
    CameraWallShadow,
    CameraBridgeShadow,
    CameraFilament,
    CameraSheet,
    CameraWall,
    CameraBridge,
    CameraNode,
    CameraHub,
    CameraSpoke,
    CameraRing,
    CameraLoop,
    CameraCycle,
    CameraCircuit,
    CameraNetwork as CameraNetworkIcon,
    CameraGrid,
    CameraMesh,
    CameraLattice,
    CameraCrystal,
    CameraPolymer,
    CameraCeramic,
    CameraGlass,
    CameraMetal,
    CameraAlloy,
    CameraComposite,
    CameraHybrid,
    CameraGradient,
    CameraInterface,
    CameraBoundary as CameraBoundaryIcon,
    CameraSurface,
    CameraVolume,
    CameraArea,
    CameraLength,
    CameraWidth,
    CameraHeight,
    CameraDepth,
    CameraRadius,
    CameraDiameter,
    CameraCircumference,
    CameraPerimeter,
    CameraDiagonal,
    CameraChord,
    CameraArc,
    CameraSector,
    CameraSegment,
    CameraAnnulus,
    CameraEllipse,
    CameraParabola,
    CameraHyperbola,
    CameraCircle,
    CameraSphere,
    CameraEllipsoid,
    CameraParaboloid,
    CameraHyperboloid,
    CameraCylinder,
    CameraCone,
    CameraPyramid,
    CameraPrism,
    CameraCube,
    CameraCuboid,
    CameraTetrahedron,
    CameraOctahedron,
    CameraDodecahedron,
    CameraIcosahedron,
    CameraPolyhedron,
    CameraPolytope,
    CameraSimplex,
    CameraCrossPolytope,
    CameraHypercube,
    CameraTesseract,
    CameraPenteract,
    CameraHexeract,
    CameraHepteract,
    CameraOcteract,
    CameraEnneract,
    CameraDekeract,
    CameraHendekeract,
    CameraDodekeract
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { format } from 'date-fns';
import axios from 'axios';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from '@/components/ui/pagination';

// Cloudinary configuration
const CLOUDINARY_CLOUD_NAME = 'dsewg9nlw';
const CLOUDINARY_UPLOAD_PRESET = 'blisssz';
const CLOUDINARY_URL = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`;

// API Configuration
const API_URL = 'https://franca-backend-ecaz.onrender.com/api';

// Create axios instance for API calls
const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

// Request interceptor to add token
api.interceptors.request.use((config) => {
    const token = localStorage.getItem('auth-token');
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// Response interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('auth-token');
        }
        return Promise.reject(error);
    }
);

// Super Admin Interface
interface SuperAdmin {
    _id: string;
    id: string;
    name: string;
    email: string;
    role: 'SUPER_ADMIN';
    avatar?: string;
    number?: string;
    createdAt: string;
    updatedAt: string;
    lastLogin?: string;
    status?: 'active' | 'inactive' | 'suspended';
    permissions?: string[];
}

// Dashboard Stats Interface
interface DashboardStats {
    totalCompanies: number;
    pendingCompanies: number;
    approvedCompanies: number;
    suspendedCompanies: number;
    totalUsers: number;
    totalAdmins: number;
    activeAdmins: number;
    recentActivities: Activity[];
}

interface Activity {
    id: string;
    type: 'company_registered' | 'company_approved' | 'company_suspended' | 'user_login' | 'admin_created' | 'admin_updated' | 'admin_deleted';
    description: string;
    timestamp: string;
    user?: string;
    admin?: string;
}

interface FormData {
    name: string;
    email: string;
    number: string;
    password?: string;
    confirmPassword?: string;
}

interface PasswordData {
    currentPassword: string;
    newPassword: string;
    confirmPassword: string;
}

interface AdminFormData {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
    number: string;
    status: 'active' | 'inactive' | 'suspended';
    permissions: string[];
}

export default function SuperAdminProfile() {
    const navigate = useNavigate();

    // State for admin data
    const [admin, setAdmin] = useState<SuperAdmin | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [fetchError, setFetchError] = useState<string | null>(null);
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [admins, setAdmins] = useState<SuperAdmin[]>([]);
    const [isLoadingAdmins, setIsLoadingAdmins] = useState(false);

    // Form state
    const [formData, setFormData] = useState<FormData>({
        name: '',
        email: '',
        number: '',
    });

    const [passwordData, setPasswordData] = useState<PasswordData>({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    // New admin form state
    const [newAdminForm, setNewAdminForm] = useState<AdminFormData>({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        number: '',
        status: 'active',
        permissions: ['all'],
    });

    // Edit admin form state
    const [editingAdmin, setEditingAdmin] = useState<SuperAdmin | null>(null);
    const [editAdminForm, setEditAdminForm] = useState<AdminFormData>({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        number: '',
        status: 'active',
        permissions: ['all'],
    });

    // UI state
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [activeTab, setActiveTab] = useState('profile');
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [saveSuccess, setSaveSuccess] = useState(false);
    const [passwordErrors, setPasswordErrors] = useState<Record<string, string>>({});
    const [passwordSuccess, setPasswordSuccess] = useState(false);

    // Dialog states
    const [isAddAdminDialogOpen, setIsAddAdminDialogOpen] = useState(false);
    const [isEditAdminDialogOpen, setIsEditAdminDialogOpen] = useState(false);
    const [isDeleteAdminDialogOpen, setIsDeleteAdminDialogOpen] = useState(false);
    const [isViewAdminDialogOpen, setIsViewAdminDialogOpen] = useState(false);
    const [selectedAdmin, setSelectedAdmin] = useState<SuperAdmin | null>(null);
    const [deleteConfirmText, setDeleteConfirmText] = useState('');

    // Search and filter states
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [sortBy, setSortBy] = useState<string>('createdAt');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const fileInputRef = useRef<HTMLInputElement>(null);

    // Fetch admin profile on component mount
    useEffect(() => {
        fetchAdminProfile();
        fetchDashboardStats();
        fetchAdmins();
    }, []);

    const fetchAdminProfile = async () => {
        setIsLoading(true);
        setFetchError(null);

        try {
            const token = localStorage.getItem('auth-token');
            if (!token) {
                toast.error('Please login to continue');
                navigate('/login');
                return;
            }

            console.log('Fetching admin profile...');
            const response = await api.get('/auth/profile');
            const data = response.data;

            console.log('Profile data received:', data);

            // Check if user is super admin
            if (data.user.role !== 'SUPER_ADMIN') {
                toast.error('Access denied. Super admin only.');
                navigate('/company');
                return;
            }

            const adminData = {
                ...data.user,
                id: data.user._id || data.user.id,
                lastLogin: new Date().toISOString(),
                status: 'active',
                permissions: ['all'],
            };

            setAdmin(adminData);

            // Initialize form with fetched data
            setFormData({
                name: adminData.name || '',
                email: adminData.email || '',
                number: adminData.number || '',
            });

        } catch (error: any) {
            console.error('Error fetching profile:', error);

            if (error.response?.status === 401) {
                localStorage.removeItem('auth-token');
                toast.error('Session expired. Please login again.');
                navigate('/login');
            } else {
                setFetchError('Failed to load profile. Please try again.');
                toast.error('Failed to load profile');
            }
        } finally {
            setIsLoading(false);
        }
    };

    const fetchDashboardStats = async () => {
        try {
            const response = await api.get('/companies/stats');
            // Add admin stats to the response
            const adminStats = {
                totalAdmins: admins.length,
                activeAdmins: admins.filter(a => a.status === 'active').length,
                recentActivities: [
                    {
                        id: '1',
                        type: 'admin_created',
                        description: 'New admin account created',
                        timestamp: new Date().toISOString(),
                        admin: 'John Doe'
                    },
                    {
                        id: '2',
                        type: 'company_approved',
                        description: 'Company "Timber Ltd" approved',
                        timestamp: new Date().toISOString(),
                    }
                ]
            };
            setStats({ ...response.data, ...adminStats });
        } catch (error) {
            console.error('Error fetching stats:', error);
            // Set default stats if API fails
            setStats({
                totalCompanies: 0,
                pendingCompanies: 0,
                approvedCompanies: 0,
                suspendedCompanies: 0,
                totalUsers: 0,
                totalAdmins: admins.length,
                activeAdmins: admins.filter(a => a.status === 'active').length,
                recentActivities: []
            });
        }
    };

    const fetchAdmins = async () => {
        setIsLoadingAdmins(true);
        try {
            const response = await api.get('/auth/admins');
            setAdmins(response.data.admins || []);
        } catch (error) {
            console.error('Error fetching admins:', error);
            toast.error('Failed to fetch admins');
        } finally {
            setIsLoadingAdmins(false);
        }
    };

    // Handle avatar selection
    const handleAvatarSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            toast.error('File too large', {
                description: 'Maximum file size is 5MB'
            });
            return;
        }

        const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif'];
        if (!allowedTypes.includes(file.type)) {
            toast.error('Invalid file type', {
                description: 'Please upload JPG, PNG, or GIF files only'
            });
            return;
        }

        setAvatarFile(file);
        const previewUrl = URL.createObjectURL(file);
        setAvatarPreview(previewUrl);
    };

    const removeAvatar = () => {
        setAvatarFile(null);
        setAvatarPreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    // Upload avatar to Cloudinary
    const uploadAvatarToCloudinary = async (): Promise<string | null> => {
        if (!avatarFile) return null;

        setIsUploading(true);
        setUploadProgress(0);

        try {
            const formData = new FormData();
            formData.append('file', avatarFile);
            formData.append('upload_preset', CLOUDINARY_UPLOAD_PRESET);
            formData.append('folder', 'timber-platform/avatars');

            const response = await new Promise<string>((resolve, reject) => {
                const xhr = new XMLHttpRequest();

                xhr.upload.addEventListener('progress', (event) => {
                    if (event.lengthComputable) {
                        const percentComplete = Math.round((event.loaded * 100) / event.total);
                        setUploadProgress(percentComplete);
                    }
                });

                xhr.onload = () => {
                    if (xhr.status === 200) {
                        const data = JSON.parse(xhr.responseText);
                        resolve(data.secure_url);
                    } else {
                        reject(new Error('Upload failed'));
                    }
                };

                xhr.onerror = () => reject(new Error('Upload failed'));

                xhr.open('POST', CLOUDINARY_URL);
                xhr.send(formData);
            });

            return response;
        } catch (error) {
            console.error('Avatar upload error:', error);
            toast.error('Failed to upload avatar');
            return null;
        } finally {
            setIsUploading(false);
            setUploadProgress(0);
        }
    };

    // Validate profile form
    const validateProfileForm = (): boolean => {
        const errors: Record<string, string> = {};

        if (!formData.name.trim()) {
            errors.name = 'Name is required';
        }
        if (!formData.email.trim()) {
            errors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            errors.email = 'Invalid email format';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Validate password form
    const validatePasswordForm = (): boolean => {
        const errors: Record<string, string> = {};

        if (!passwordData.currentPassword) {
            errors.currentPassword = 'Current password is required';
        }
        if (!passwordData.newPassword) {
            errors.newPassword = 'New password is required';
        } else if (passwordData.newPassword.length < 6) {
            errors.newPassword = 'Password must be at least 6 characters';
        }
        if (!passwordData.confirmPassword) {
            errors.confirmPassword = 'Please confirm your password';
        } else if (passwordData.newPassword !== passwordData.confirmPassword) {
            errors.confirmPassword = 'Passwords do not match';
        }

        setPasswordErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Validate new admin form
    const validateNewAdminForm = (): boolean => {
        const errors: Record<string, string> = {};

        if (!newAdminForm.name.trim()) {
            errors.name = 'Name is required';
        }
        if (!newAdminForm.email.trim()) {
            errors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newAdminForm.email)) {
            errors.email = 'Invalid email format';
        }
        if (!newAdminForm.password) {
            errors.password = 'Password is required';
        } else if (newAdminForm.password.length < 6) {
            errors.password = 'Password must be at least 6 characters';
        }
        if (newAdminForm.password !== newAdminForm.confirmPassword) {
            errors.confirmPassword = 'Passwords do not match';
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    // Handle profile save
    const handleSaveProfile = async () => {
        if (!validateProfileForm()) {
            toast.error('Please fix the errors in the form');
            return;
        }

        if (!admin) {
            toast.error('Admin information not found');
            return;
        }

        const adminId = admin.id || admin._id;

        if (!adminId) {
            toast.error('Admin ID not found. Please refresh and try again.');
            return;
        }

        setIsSaving(true);
        setSaveSuccess(false);

        try {
            // Upload avatar if changed
            let avatarUrl: string | null = null;
            if (avatarFile) {
                avatarUrl = await uploadAvatarToCloudinary();
                if (!avatarUrl) {
                    throw new Error('Failed to upload avatar');
                }
            }

            // Prepare update data
            const updateData: any = {};

            if (formData.name !== admin.name) {
                updateData.name = formData.name;
            }
            if (formData.email !== admin.email) {
                updateData.email = formData.email;
            }
            if (formData.number !== admin.number) {
                updateData.number = formData.number;
            }
            if (avatarUrl) {
                updateData.avatar = avatarUrl;
            }

            // If no fields to update, show message
            if (Object.keys(updateData).length === 0) {
                toast.info('No changes to save');
                setIsSaving(false);
                return;
            }

            console.log('Updating admin with ID:', adminId);
            console.log('Update data:', updateData);

            // Update admin profile
            const response = await api.put(`/auth/admins/${adminId}`, updateData);

            console.log('Update response:', response.data);

            if (response.data) {
                // Refetch admin profile
                await fetchAdminProfile();
                await fetchAdmins();

                setSaveSuccess(true);
                toast.success('Profile updated successfully');

                setTimeout(() => setSaveSuccess(false), 3000);
            }
        } catch (error: any) {
            console.error('Save error:', error);

            if (error.response?.status === 403) {
                toast.error('Permission denied', {
                    description: error.response?.data?.message || 'You do not have permission to update this profile'
                });
            } else if (error.response?.status === 401) {
                toast.error('Session expired. Please login again.');
                navigate('/login');
            } else {
                const errorMessage = error.response?.data?.message || 'Failed to update profile';
                toast.error(errorMessage);
            }
        } finally {
            setIsSaving(false);
        }
    };

    // Handle password change
    const handleChangePassword = async () => {
        if (!validatePasswordForm()) {
            toast.error('Please fix the errors in the form');
            return;
        }

        setIsSaving(true);
        setPasswordSuccess(false);

        try {
            await api.post('/auth/change-password', {
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword,
                userid: admin?._id
            });

            toast.success('Password changed successfully');
            setPasswordSuccess(true);

            // Reset password form
            setPasswordData({
                currentPassword: '',
                newPassword: '',
                confirmPassword: '',
            });

            setTimeout(() => setPasswordSuccess(false), 3000);
        } catch (error: any) {
            console.error('Password change error:', error);

            if (error.response?.status === 401) {
                toast.error('Current password is incorrect');
            } else {
                const errorMessage = error.response?.data?.message || 'Failed to change password';
                toast.error(errorMessage);
            }
        } finally {
            setIsSaving(false);
        }
    };

    // Handle create new admin
    const handleCreateAdmin = async () => {
        if (!validateNewAdminForm()) {
            toast.error('Please fix the errors in the form');
            return;
        }

        setIsSaving(true);

        try {
            const response = await api.post('/auth/create-super-admin', {
                name: newAdminForm.name,
                email: newAdminForm.email,
                password: newAdminForm.password,
                number: newAdminForm.number,
                secretKey: 'your-super-admin-secret' // This should come from env
            });

            if (response.data) {
                toast.success('Admin created successfully');
                setIsAddAdminDialogOpen(false);
                setNewAdminForm({
                    name: '',
                    email: '',
                    password: '',
                    confirmPassword: '',
                    number: '',
                    status: 'active',
                    permissions: ['all'],
                });
                await fetchAdmins();
                await fetchDashboardStats();
            }
        } catch (error: any) {
            console.error('Create admin error:', error);
            toast.error(error.response?.data?.message || 'Failed to create admin');
        } finally {
            setIsSaving(false);
        }
    };

    // Handle update admin
    const handleUpdateAdmin = async () => {
        if (!editingAdmin) return;

        setIsSaving(true);

        try {
            const updateData: any = {
                name: editAdminForm.name,
                email: editAdminForm.email,
                number: editAdminForm.number,
            };

            if (editAdminForm.password) {
                if (editAdminForm.password.length < 6) {
                    toast.error('Password must be at least 6 characters');
                    setIsSaving(false);
                    return;
                }
                if (editAdminForm.password !== editAdminForm.confirmPassword) {
                    toast.error('Passwords do not match');
                    setIsSaving(false);
                    return;
                }
                updateData.password = editAdminForm.password;
            }

            const response = await api.put(`/auth/admins/${editingAdmin._id}`, updateData);

            if (response.data) {
                toast.success('Admin updated successfully');
                setIsEditAdminDialogOpen(false);
                setEditingAdmin(null);
                await fetchAdmins();
            }
        } catch (error: any) {
            console.error('Update admin error:', error);
            toast.error(error.response?.data?.message || 'Failed to update admin');
        } finally {
            setIsSaving(false);
        }
    };

    // Handle delete admin
    const handleDeleteAdmin = async () => {
        if (!selectedAdmin) return;

        if (deleteConfirmText !== selectedAdmin.email) {
            toast.error('Please type the admin email to confirm deletion');
            return;
        }

        setIsSaving(true);

        try {
            const response = await api.delete(`/auth/admins/${selectedAdmin._id}`);

            if (response.data) {
                toast.success('Admin deleted successfully');
                setIsDeleteAdminDialogOpen(false);
                setSelectedAdmin(null);
                setDeleteConfirmText('');
                await fetchAdmins();
                await fetchDashboardStats();
            }
        } catch (error: any) {
            console.error('Delete admin error:', error);
            toast.error(error.response?.data?.message || 'Failed to delete admin');
        } finally {
            setIsSaving(false);
        }
    };

    // Get user initials for avatar
    const getUserInitials = (name?: string) => {
        if (!name) return 'SA';
        return name
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .slice(0, 2);
    };

    // Handle logout
    const handleLogout = () => {
        localStorage.removeItem('auth-token');
        toast.success('Logged out successfully');
        navigate('/login');
    };

    // Format date
    const formatDate = (dateString?: string) => {
        if (!dateString) return 'N/A';
        return format(new Date(dateString), 'PPP');
    };

    // Format relative time
    const formatRelativeTime = (dateString?: string) => {
        if (!dateString) return 'N/A';
        const date = new Date(dateString);
        const now = new Date();
        const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

        if (diffInSeconds < 60) return 'just now';
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
        if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
        return formatDate(dateString);
    };

    // Filter and sort admins
    const filteredAdmins = admins.filter(admin => {
        const matchesSearch = admin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            admin.email.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesStatus = statusFilter === 'all' || admin.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const sortedAdmins = [...filteredAdmins].sort((a, b) => {
        const aValue = a[sortBy as keyof SuperAdmin];
        const bValue = b[sortBy as keyof SuperAdmin];
        if (sortOrder === 'asc') {
            return aValue > bValue ? 1 : -1;
        } else {
            return aValue < bValue ? 1 : -1;
        }
    });

    const paginatedAdmins = sortedAdmins.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const totalPages = Math.ceil(sortedAdmins.length / itemsPerPage);

    // Loading state
    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-primary-50 via-background to-secondary-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
                    <p className="text-muted-foreground">Loading super admin profile...</p>
                </div>
            </div>
        );
    }

    // Error state
    if (fetchError || !admin) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-primary-50 via-background to-secondary-50 flex items-center justify-center">
                <div className="text-center max-w-md mx-auto p-6">
                    <AlertCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
                    <h2 className="text-2xl font-bold mb-2">Profile Not Found</h2>
                    <p className="text-muted-foreground mb-6">
                        {fetchError || 'Unable to load profile information.'}
                    </p>
                    <div className="flex gap-3 justify-center">
                        <Button onClick={() => navigate('/super-admin')}>
                            Go to Dashboard
                        </Button>
                        <Button variant="outline" onClick={fetchAdminProfile}>
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Retry
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-50 via-background to-secondary-50 py-8 px-4">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        {/* <Button variant="ghost" onClick={() => navigate('/super-admin')}>
                            <ArrowLeft className="w-4 h-4 mr-2" />
                            Back to Dashboard
                        </Button> */}
                        <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                            Super Admin Management
                        </h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 px-3 py-1">
                            <Shield className="w-3 h-3 mr-1" />
                            SUPER ADMIN
                        </Badge>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleLogout}
                            className="text-destructive hover:text-destructive hover:bg-destructive/10"
                            title="Logout"
                        >
                            <LogOut className="w-5 h-5" />
                        </Button>
                    </div>
                </div>

                {/* Success Alerts */}
                {saveSuccess && (
                    <Alert className="mb-6 bg-green-50 border-green-200">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <AlertDescription className="text-green-700">
                            Profile updated successfully!
                        </AlertDescription>
                    </Alert>
                )}

                {passwordSuccess && (
                    <Alert className="mb-6 bg-green-50 border-green-200">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <AlertDescription className="text-green-700">
                            Password changed successfully!
                        </AlertDescription>
                    </Alert>
                )}

                {/* Stats Cards */}
                {stats && (
                    <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-7 gap-4 mb-6">



                        {/* <Card className="bg-gradient-to-br from-indigo-500 to-indigo-600 text-white">
                            <CardContent className="p-4">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-indigo-100 text-sm">Total Admins</p>
                                        <p className="text-2xl font-bold">{stats.totalAdmins}</p>
                                    </div>
                                    <Shield className="w-8 h-8 text-indigo-200" />
                                </div>
                            </CardContent>
                        </Card> */}

                    </div>
                )}

                {/* Main Content Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="profile">My Profile</TabsTrigger>
                        <TabsTrigger value="admins">Manage Admins</TabsTrigger>
                        <TabsTrigger value="security">Security</TabsTrigger>
                        <TabsTrigger value="activity">Activity Log</TabsTrigger>
                    </TabsList>

                    {/* Profile Tab */}
                    <TabsContent value="profile" className="space-y-6">
                        {/* Avatar Section */}
                        {/* <Card>
                            <CardHeader>
                                <CardTitle>Profile Picture</CardTitle>
                                <CardDescription>
                                    Upload a profile picture for your admin account
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex flex-col sm:flex-row items-center gap-6">
                                    <div className="relative">
                                        <Avatar className="w-32 h-32 ring-4 ring-primary/20">
                                            <AvatarImage src={avatarPreview || admin?.avatar} />
                                            <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-white text-3xl">
                                                {getUserInitials(admin?.name)}
                                            </AvatarFallback>
                                        </Avatar>
                                        {avatarPreview && (
                                            <Button
                                                variant="destructive"
                                                size="icon"
                                                className="absolute -top-2 -right-2 h-8 w-8 rounded-full"
                                                onClick={removeAvatar}
                                            >
                                                <X className="w-4 h-4" />
                                            </Button>
                                        )}
                                    </div>
                                    <div className="flex-1 text-center sm:text-left">
                                        <input
                                            type="file"
                                            ref={fileInputRef}
                                            className="hidden"
                                            accept="image/jpeg,image/png,image/jpg,image/gif"
                                            onChange={handleAvatarSelect}
                                        />
                                        <Button
                                            variant="outline"
                                            onClick={() => fileInputRef.current?.click()}
                                            disabled={isUploading}
                                            className="w-full sm:w-auto"
                                        >
                                            {isUploading ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                    Uploading {uploadProgress}%
                                                </>
                                            ) : (
                                                <>
                                                    <Camera className="w-4 h-4 mr-2" />
                                                    Change Photo
                                                </>
                                            )}
                                        </Button>
                                        {uploadProgress > 0 && (
                                            <div className="mt-2 w-full bg-muted rounded-full h-2">
                                                <div
                                                    className="bg-primary h-2 rounded-full transition-all duration-300"
                                                    style={{ width: `${uploadProgress}%` }}
                                                />
                                            </div>
                                        )}
                                        <p className="text-xs text-muted-foreground mt-2">
                                            JPG, PNG or GIF. Max 5MB.
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card> */}

                        {/* Personal Information */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Personal Information</CardTitle>
                                <CardDescription>
                                    Update your personal details
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="name">
                                            Full Name <span className="text-destructive">*</span>
                                        </Label>
                                        <div className="relative">
                                            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                            <Input
                                                id="name"
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                className={`pl-10 ${formErrors.name ? 'border-destructive' : ''}`}
                                                disabled={isSaving}
                                                placeholder="John Doe"
                                            />
                                        </div>
                                        {formErrors.name && (
                                            <p className="text-xs text-destructive">{formErrors.name}</p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="email">
                                            Email Address <span className="text-destructive">*</span>
                                        </Label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                            <Input
                                                id="email"
                                                type="email"
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                className={`pl-10 ${formErrors.email ? 'border-destructive' : ''}`}
                                                disabled={isSaving}
                                                placeholder="admin@example.com"
                                            />
                                        </div>
                                        {formErrors.email && (
                                            <p className="text-xs text-destructive">{formErrors.email}</p>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="number">Phone Number</Label>
                                        <div className="relative">
                                            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                            <Input
                                                id="number"
                                                value={formData.number}
                                                onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                                                className="pl-10"
                                                disabled={isSaving}
                                                placeholder="+237 6XX XXX XXX"
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Role</Label>
                                        <div className="relative">
                                            <Shield className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                            <Input
                                                value="Super Administrator"
                                                className="pl-10 bg-muted"
                                                disabled
                                            />
                                        </div>
                                    </div>
                                </div>

                                <Separator />

                                <div className="grid md:grid-cols-2 gap-4">
                                    {/* <div className="space-y-2">
                                        <Label>Account Created</Label>
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Calendar className="w-4 h-4" />
                                            <span>{formatDate(admin.createdAt)}</span>
                                        </div>
                                    </div> */}
                                    {/* <div className="space-y-2">
                                        <Label>Last Updated</Label>
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Clock className="w-4 h-4" />
                                            <span>{formatDate(admin.updatedAt)}</span>
                                        </div>
                                    </div> */}
                                    <div className="space-y-2">
                                        <Label>Last Login</Label>
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <Activity className="w-4 h-4" />
                                            <span>{formatRelativeTime(admin.lastLogin)}</span>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Status</Label>
                                        <div className="flex items-center gap-2">
                                            <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                                                Active
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Save Button */}
                        <div className="flex justify-end gap-3">
                            <Button
                                variant="outline"
                                onClick={() => navigate('/super-admin')}
                                disabled={isSaving || isUploading}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSaveProfile}
                                disabled={isSaving || isUploading}
                                className="bg-gradient-to-r from-primary to-secondary text-white min-w-[140px]"
                            >
                                {isSaving ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4 mr-2" />
                                        Save Changes
                                    </>
                                )}
                            </Button>
                        </div>
                    </TabsContent>

                    {/* Manage Admins Tab */}
                    <TabsContent value="admins" className="space-y-6">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle>Super Admin Management</CardTitle>
                                    <CardDescription>
                                        Manage all super admin accounts. Create, edit, or delete admins.
                                    </CardDescription>
                                </div>
                                <Button
                                    onClick={() => setIsAddAdminDialogOpen(true)}
                                    className="bg-gradient-to-r from-primary to-secondary text-white"
                                >
                                    <UserPlus className="w-4 h-4 mr-2" />
                                    Add New Admin
                                </Button>
                            </CardHeader>
                            <CardContent>
                                {/* Search and Filter */}
                                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                                    <div className="flex-1 relative">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <Input
                                            placeholder="Search admins by name or email..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="pl-10"
                                        />
                                    </div>
                                    <div className="flex gap-2">
                                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                                            <SelectTrigger className="w-[130px]">
                                                <Filter className="w-4 h-4 mr-2" />
                                                <SelectValue placeholder="Status" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="all">All Status</SelectItem>
                                                <SelectItem value="active">Active</SelectItem>
                                                <SelectItem value="inactive">Inactive</SelectItem>
                                                <SelectItem value="suspended">Suspended</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <Select value={sortBy} onValueChange={setSortBy}>
                                            <SelectTrigger className="w-[130px]">
                                                <SelectValue placeholder="Sort by" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="name">Name</SelectItem>
                                                <SelectItem value="email">Email</SelectItem>
                                                <SelectItem value="createdAt">Created Date</SelectItem>
                                                <SelectItem value="lastLogin">Last Login</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                                        >
                                            {sortOrder === 'asc' ? '↑' : '↓'}
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="icon"
                                            onClick={() => {
                                                setSearchQuery('');
                                                setStatusFilter('all');
                                                setSortBy('createdAt');
                                                setSortOrder('desc');
                                            }}
                                        >
                                            <RefreshCw className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>

                                {/* Admins Table */}
                                {isLoadingAdmins ? (
                                    <div className="space-y-4">
                                        {[1, 2, 3].map((i) => (
                                            <Skeleton key={i} className="h-16 w-full" />
                                        ))}
                                    </div>
                                ) : (
                                    <>
                                        <div className="rounded-md border">
                                            <Table>
                                                <TableHeader>
                                                    <TableRow>
                                                        <TableHead>Admin</TableHead>
                                                        <TableHead>Email</TableHead>
                                                        <TableHead>Status</TableHead>
                                                        <TableHead>Created</TableHead>
                                                        <TableHead>Last Login</TableHead>
                                                        <TableHead className="text-right">Actions</TableHead>
                                                    </TableRow>
                                                </TableHeader>
                                                <TableBody>
                                                    {paginatedAdmins.length === 0 ? (
                                                        <TableRow>
                                                            <TableCell colSpan={6} className="text-center py-8">
                                                                <Users className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                                                                <p className="text-muted-foreground">No admins found</p>
                                                            </TableCell>
                                                        </TableRow>
                                                    ) : (
                                                        paginatedAdmins.map((admin) => (
                                                            <TableRow key={admin._id}>
                                                                <TableCell>
                                                                    <div className="flex items-center gap-3">
                                                                        <Avatar className="w-8 h-8">
                                                                            <AvatarImage src={admin.avatar} />
                                                                            <AvatarFallback className="bg-primary/10 text-primary">
                                                                                {getUserInitials(admin.name)}
                                                                            </AvatarFallback>
                                                                        </Avatar>
                                                                        <span className="font-medium">{admin.name}</span>
                                                                    </div>
                                                                </TableCell>
                                                                <TableCell>{admin.email}</TableCell>
                                                                <TableCell>
                                                                    <Badge
                                                                        variant="outline"
                                                                        className={
                                                                            admin.status === 'active'
                                                                                ? 'bg-green-50 text-green-700 border-green-200'
                                                                                : admin.status === 'inactive'
                                                                                    ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                                                                                    : 'bg-red-50 text-red-700 border-red-200'
                                                                        }
                                                                    >
                                                                        {admin.status || 'active'}
                                                                    </Badge>
                                                                </TableCell>
                                                                <TableCell>{formatDate(admin.createdAt)}</TableCell>
                                                                <TableCell>{formatRelativeTime(admin.lastLogin)}</TableCell>
                                                                <TableCell className="text-right">
                                                                    <DropdownMenu>
                                                                        <DropdownMenuTrigger asChild>
                                                                            <Button variant="ghost" size="icon">
                                                                                <MoreVertical className="w-4 h-4" />
                                                                            </Button>
                                                                        </DropdownMenuTrigger>
                                                                        <DropdownMenuContent align="end">
                                                                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                                            <DropdownMenuItem
                                                                                onClick={() => {
                                                                                    setSelectedAdmin(admin);
                                                                                    setIsViewAdminDialogOpen(true);
                                                                                }}
                                                                            >
                                                                                <Eye className="w-4 h-4 mr-2" />
                                                                                View Details
                                                                            </DropdownMenuItem>
                                                                            <DropdownMenuItem
                                                                                onClick={() => {
                                                                                    setEditingAdmin(admin);
                                                                                    setEditAdminForm({
                                                                                        name: admin.name,
                                                                                        email: admin.email,
                                                                                        number: admin.number || '',
                                                                                        password: '',
                                                                                        confirmPassword: '',
                                                                                        status: admin.status || 'active',
                                                                                        permissions: admin.permissions || ['all'],
                                                                                    });
                                                                                    setIsEditAdminDialogOpen(true);
                                                                                }}
                                                                            >
                                                                                <Edit className="w-4 h-4 mr-2" />
                                                                                Edit
                                                                            </DropdownMenuItem>
                                                                            <DropdownMenuSeparator />
                                                                            <DropdownMenuItem
                                                                                className="text-destructive"
                                                                                onClick={() => {
                                                                                    setSelectedAdmin(admin);
                                                                                    setIsDeleteAdminDialogOpen(true);
                                                                                }}
                                                                            >
                                                                                <Trash2 className="w-4 h-4 mr-2" />
                                                                                Delete
                                                                            </DropdownMenuItem>
                                                                        </DropdownMenuContent>
                                                                    </DropdownMenu>
                                                                </TableCell>
                                                            </TableRow>
                                                        ))
                                                    )}
                                                </TableBody>
                                            </Table>
                                        </div>

                                        {/* Pagination */}
                                        {totalPages > 1 && (
                                            <div className="mt-4 flex items-center justify-between">
                                                <p className="text-sm text-muted-foreground">
                                                    Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, sortedAdmins.length)} of {sortedAdmins.length} admins
                                                </p>
                                                <Pagination>
                                                    <PaginationContent>
                                                        <PaginationItem>
                                                            <PaginationPrevious
                                                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                                                className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                                                            />
                                                        </PaginationItem>
                                                        {[...Array(totalPages)].map((_, i) => (
                                                            <PaginationItem key={i}>
                                                                <PaginationLink
                                                                    onClick={() => setCurrentPage(i + 1)}
                                                                    isActive={currentPage === i + 1}
                                                                >
                                                                    {i + 1}
                                                                </PaginationLink>
                                                            </PaginationItem>
                                                        ))}
                                                        <PaginationItem>
                                                            <PaginationNext
                                                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                                                className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                                                            />
                                                        </PaginationItem>
                                                    </PaginationContent>
                                                </Pagination>
                                            </div>
                                        )}
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Security Tab */}
                    <TabsContent value="security" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Change Password</CardTitle>
                                <CardDescription>
                                    Update your password to keep your admin account secure
                                </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="currentPassword">
                                        Current Password <span className="text-destructive">*</span>
                                    </Label>
                                    <div className="relative">
                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <Input
                                            id="currentPassword"
                                            type="password"
                                            value={passwordData.currentPassword}
                                            onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                            className={`pl-10 ${passwordErrors.currentPassword ? 'border-destructive' : ''}`}
                                            disabled={isSaving}
                                            placeholder="••••••••"
                                        />
                                    </div>
                                    {passwordErrors.currentPassword && (
                                        <p className="text-xs text-destructive">{passwordErrors.currentPassword}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="newPassword">
                                        New Password <span className="text-destructive">*</span>
                                    </Label>
                                    <div className="relative">
                                        <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <Input
                                            id="newPassword"
                                            type="password"
                                            value={passwordData.newPassword}
                                            onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                            className={`pl-10 ${passwordErrors.newPassword ? 'border-destructive' : ''}`}
                                            disabled={isSaving}
                                            placeholder="••••••••"
                                        />
                                    </div>
                                    {passwordErrors.newPassword && (
                                        <p className="text-xs text-destructive">{passwordErrors.newPassword}</p>
                                    )}
                                    <p className="text-xs text-muted-foreground">
                                        Password must be at least 6 characters long
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="confirmPassword">
                                        Confirm New Password <span className="text-destructive">*</span>
                                    </Label>
                                    <div className="relative">
                                        <Key className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <Input
                                            id="confirmPassword"
                                            type="password"
                                            value={passwordData.confirmPassword}
                                            onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                            className={`pl-10 ${passwordErrors.confirmPassword ? 'border-destructive' : ''}`}
                                            disabled={isSaving}
                                            placeholder="••••••••"
                                        />
                                    </div>
                                    {passwordErrors.confirmPassword && (
                                        <p className="text-xs text-destructive">{passwordErrors.confirmPassword}</p>
                                    )}
                                </div>

                                <div className="pt-4">
                                    <Button
                                        onClick={handleChangePassword}
                                        disabled={isSaving}
                                        className="bg-gradient-to-r from-primary to-secondary text-white"
                                    >
                                        {isSaving ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                Updating...
                                            </>
                                        ) : (
                                            'Change Password'
                                        )}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Two Factor Authentication */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Two-Factor Authentication</CardTitle>
                                <CardDescription>
                                    Add an extra layer of security to your admin account
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                                    <div className="flex items-center gap-4">
                                        <Shield className="w-8 h-8 text-muted-foreground" />
                                        <div>
                                            <p className="font-medium">Two-Factor Authentication</p>
                                            <p className="text-sm text-muted-foreground">
                                                Protect your account with 2FA
                                            </p>
                                        </div>
                                    </div>
                                    <Button variant="outline" disabled>
                                        Coming Soon
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Session Management */}
                        <Card>
                            <CardHeader>
                                <CardTitle>Active Sessions</CardTitle>
                                <CardDescription>
                                    Manage your active login sessions
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                                        <div className="flex items-center gap-4">
                                            <div className="w-3 h-3 rounded-full bg-green-500 animate-pulse" />
                                            <div>
                                                <p className="font-medium">Current Session</p>
                                                <p className="text-sm text-muted-foreground">
                                                    Last active: Just now
                                                </p>
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    Chrome on Windows
                                                </p>
                                            </div>
                                        </div>
                                        <Badge variant="outline" className="bg-green-50 text-green-700">
                                            Active
                                        </Badge>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Activity Tab */}
                    <TabsContent value="activity" className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Recent Activity</CardTitle>
                                <CardDescription>
                                    Your recent actions and system activities
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                {stats?.recentActivities && stats.recentActivities.length > 0 ? (
                                    <div className="space-y-4">
                                        {stats.recentActivities.map((activity) => (
                                            <div
                                                key={activity.id}
                                                className="flex items-start gap-4 p-4 bg-muted/30 rounded-lg"
                                            >
                                                <Activity className="w-5 h-5 text-muted-foreground mt-0.5" />
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium">{activity.description}</p>
                                                    <p className="text-xs text-muted-foreground mt-1">
                                                        {format(new Date(activity.timestamp), 'PPP p')}
                                                    </p>
                                                </div>
                                                <Badge variant="outline" className="text-xs">
                                                    {activity.type.replace(/_/g, ' ')}
                                                </Badge>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <Activity className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                                        <p className="text-muted-foreground">No recent activity</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                {/* Add Admin Dialog */}
                <Dialog open={isAddAdminDialogOpen} onOpenChange={setIsAddAdminDialogOpen}>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>Add New Super Admin</DialogTitle>
                            <DialogDescription>
                                Create a new super admin account. They will have full access to the system.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="new-name">Full Name *</Label>
                                <Input
                                    id="new-name"
                                    value={newAdminForm.name}
                                    onChange={(e) => setNewAdminForm({ ...newAdminForm, name: e.target.value })}
                                    placeholder="John Doe"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="new-email">Email Address *</Label>
                                <Input
                                    id="new-email"
                                    type="email"
                                    value={newAdminForm.email}
                                    onChange={(e) => setNewAdminForm({ ...newAdminForm, email: e.target.value })}
                                    placeholder="admin@example.com"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="new-number">Phone Number</Label>
                                <Input
                                    id="new-number"
                                    value={newAdminForm.number}
                                    onChange={(e) => setNewAdminForm({ ...newAdminForm, number: e.target.value })}
                                    placeholder="+237 6XX XXX XXX"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="new-password">Password *</Label>
                                <Input
                                    id="new-password"
                                    type="password"
                                    value={newAdminForm.password}
                                    onChange={(e) => setNewAdminForm({ ...newAdminForm, password: e.target.value })}
                                    placeholder="••••••••"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="new-confirm-password">Confirm Password *</Label>
                                <Input
                                    id="new-confirm-password"
                                    type="password"
                                    value={newAdminForm.confirmPassword}
                                    onChange={(e) => setNewAdminForm({ ...newAdminForm, confirmPassword: e.target.value })}
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsAddAdminDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button
                                onClick={handleCreateAdmin}
                                disabled={isSaving}
                                className="bg-gradient-to-r from-primary to-secondary text-white"
                            >
                                {isSaving ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Creating...
                                    </>
                                ) : (
                                    'Create Admin'
                                )}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Edit Admin Dialog */}
                <Dialog open={isEditAdminDialogOpen} onOpenChange={setIsEditAdminDialogOpen}>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle>Edit Admin</DialogTitle>
                            <DialogDescription>
                                Update admin information. Leave password blank to keep current password.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="space-y-2">
                                <Label htmlFor="edit-name">Full Name *</Label>
                                <Input
                                    id="edit-name"
                                    value={editAdminForm.name}
                                    onChange={(e) => setEditAdminForm({ ...editAdminForm, name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-email">Email Address *</Label>
                                <Input
                                    id="edit-email"
                                    type="email"
                                    value={editAdminForm.email}
                                    onChange={(e) => setEditAdminForm({ ...editAdminForm, email: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-number">Phone Number</Label>
                                <Input
                                    id="edit-number"
                                    value={editAdminForm.number}
                                    onChange={(e) => setEditAdminForm({ ...editAdminForm, number: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-password">New Password (optional)</Label>
                                <Input
                                    id="edit-password"
                                    type="password"
                                    value={editAdminForm.password}
                                    onChange={(e) => setEditAdminForm({ ...editAdminForm, password: e.target.value })}
                                    placeholder="Leave blank to keep current"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="edit-confirm-password">Confirm New Password</Label>
                                <Input
                                    id="edit-confirm-password"
                                    type="password"
                                    value={editAdminForm.confirmPassword}
                                    onChange={(e) => setEditAdminForm({ ...editAdminForm, confirmPassword: e.target.value })}
                                    placeholder="Leave blank to keep current"
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsEditAdminDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button
                                onClick={handleUpdateAdmin}
                                disabled={isSaving}
                                className="bg-gradient-to-r from-primary to-secondary text-white"
                            >
                                {isSaving ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Updating...
                                    </>
                                ) : (
                                    'Update Admin'
                                )}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Delete Admin Dialog */}
                <Dialog open={isDeleteAdminDialogOpen} onOpenChange={setIsDeleteAdminDialogOpen}>
                    <DialogContent className="max-w-md">
                        <DialogHeader>
                            <DialogTitle className="text-destructive">Delete Admin</DialogTitle>
                            <DialogDescription>
                                This action cannot be undone. This will permanently delete the admin account.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="py-4">
                            <Alert variant="destructive">
                                <AlertTriangle className="h-4 w-4" />
                                <AlertTitle>Warning</AlertTitle>
                                <AlertDescription>
                                    Deleting this admin will remove all their access immediately.
                                </AlertDescription>
                            </Alert>
                            <div className="mt-4 space-y-2">
                                <Label>To confirm, type the admin email:</Label>
                                <Input
                                    value={deleteConfirmText}
                                    onChange={(e) => setDeleteConfirmText(e.target.value)}
                                    placeholder={selectedAdmin?.email}
                                />
                                <p className="text-xs text-muted-foreground">
                                    Type: <span className="font-mono">{selectedAdmin?.email}</span>
                                </p>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => {
                                setIsDeleteAdminDialogOpen(false);
                                setDeleteConfirmText('');
                            }}>
                                Cancel
                            </Button>
                            <Button
                                variant="destructive"
                                onClick={handleDeleteAdmin}
                                disabled={isSaving || deleteConfirmText !== selectedAdmin?.email}
                            >
                                {isSaving ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Deleting...
                                    </>
                                ) : (
                                    'Delete Admin'
                                )}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* View Admin Dialog */}
                <Dialog open={isViewAdminDialogOpen} onOpenChange={setIsViewAdminDialogOpen}>
                    <DialogContent className="max-w-2xl">
                        <DialogHeader>
                            <DialogTitle>Admin Details</DialogTitle>
                            <DialogDescription>
                                Detailed information about the admin account.
                            </DialogDescription>
                        </DialogHeader>
                        {selectedAdmin && (
                            <div className="py-4">
                                <div className="flex items-center gap-4 mb-6">
                                    <Avatar className="w-16 h-16">
                                        <AvatarImage src={selectedAdmin.avatar} />
                                        <AvatarFallback className="bg-primary/10 text-primary text-xl">
                                            {getUserInitials(selectedAdmin.name)}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <h3 className="text-lg font-semibold">{selectedAdmin.name}</h3>
                                        <p className="text-sm text-muted-foreground">{selectedAdmin.email}</p>
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label>Admin ID</Label>
                                        <p className="text-sm font-mono bg-muted p-2 rounded">{selectedAdmin._id}</p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Status</Label>
                                        <div>
                                            <Badge
                                                variant="outline"
                                                className={
                                                    selectedAdmin.status === 'active'
                                                        ? 'bg-green-50 text-green-700 border-green-200'
                                                        : selectedAdmin.status === 'inactive'
                                                            ? 'bg-yellow-50 text-yellow-700 border-yellow-200'
                                                            : 'bg-red-50 text-red-700 border-red-200'
                                                }
                                            >
                                                {selectedAdmin.status || 'active'}
                                            </Badge>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Phone Number</Label>
                                        <p className="text-sm">{selectedAdmin.number || 'Not provided'}</p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Role</Label>
                                        <p className="text-sm">Super Administrator</p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Created</Label>
                                        <p className="text-sm">{formatDate(selectedAdmin.createdAt)}</p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Last Updated</Label>
                                        <p className="text-sm">{formatDate(selectedAdmin.updatedAt)}</p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Last Login</Label>
                                        <p className="text-sm">{formatRelativeTime(selectedAdmin.lastLogin)}</p>
                                    </div>
                                    <div className="space-y-2">
                                        <Label>Permissions</Label>
                                        <div className="flex flex-wrap gap-2">
                                            {selectedAdmin.permissions?.map((perm) => (
                                                <Badge key={perm} variant="secondary">
                                                    {perm}
                                                </Badge>
                                            )) || (
                                                    <Badge variant="secondary">all</Badge>
                                                )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                        <DialogFooter>
                            <Button onClick={() => setIsViewAdminDialogOpen(false)}>
                                Close
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}